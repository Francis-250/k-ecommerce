import { prisma } from "../lib/prisma";
import { generateImageEmbedding, analyzeImageWithGroq, GroqVisualAnalysis } from "../lib/vision";

export interface SimilarProductResult {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
    variants?: any[];
  };
  similarity: number;
}

export interface ImageSearchResponse {
  products: any[];
  analysis: GroqVisualAnalysis | null;
  totalFound: number;
}

/**
 * Update a ProductImage record with its vector embedding
 */
export async function saveImageEmbedding(productImageId: string, imageUrl: string): Promise<boolean> {
  try {
    const embedding = await generateImageEmbedding(imageUrl);
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `UPDATE "ProductImage" SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      productImageId
    );
    return true;
  } catch (error) {
    console.error(`Failed to save image embedding for image ${productImageId}:`, error);
    return false;
  }
}

/**
 * Search for visually similar products using an uploaded image URL or Buffer
 */
export async function searchProductsByImage(
  imageUrlOrBuffer: string | Buffer,
  limit: number = 12,
  imageUrlForGroq?: string
): Promise<ImageSearchResponse> {
  // 1. Perform LangChain Groq visual analysis if imageUrlForGroq is provided
  let groqAnalysis: GroqVisualAnalysis | null = null;
  if (imageUrlForGroq) {
    try {
      const groqPromise = analyzeImageWithGroq(imageUrlForGroq);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 4500)
      );
      groqAnalysis = await Promise.race([groqPromise, timeoutPromise]);
    } catch (e) {
      console.warn("LangChain Groq visual analysis skipped/errored:", e);
    }
  }

  // 2. CONTEXT GATING: Rejection of non-store products (e.g., car, vehicle, building, animal)
  if (groqAnalysis && groqAnalysis.isEcommerceProduct === false) {
    console.log(
      `[AI Search] Image gated: Detected non-ecommerce object '${groqAnalysis.productType}' (${groqAnalysis.rejectionReason})`
    );
    return {
      products: [],
      analysis: groqAnalysis,
      totalFound: 0,
    };
  }

  // 3. Generate query embedding vector
  const queryEmbedding = await generateImageEmbedding(imageUrlOrBuffer);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // 4. Vector similarity search in PostgreSQL via pgvector (fetch wider candidate set for re-ranking)
  const rawResults: any[] = await prisma.$queryRawUnsafe(
    `
    SELECT 
      pi."productId",
      MIN(pi.embedding <=> $1::vector) as min_distance,
      1 - MIN(pi.embedding <=> $1::vector) as similarity
    FROM "ProductImage" pi
    JOIN "Product" p ON p.id = pi."productId"
    WHERE pi.embedding IS NOT NULL AND p.status = 'ACTIVE'
    GROUP BY pi."productId"
    ORDER BY min_distance ASC
    LIMIT $2
    `,
    vectorString,
    limit * 3
  );

  if (!rawResults || rawResults.length === 0) {
    return { products: [], analysis: groqAnalysis, totalFound: 0 };
  }

  const candidateIds = rawResults.map((r) => r.productId);
  const similarityMap = new Map(
    rawResults.map((r) => [r.productId, Number(r.similarity)])
  );

  // 5. Fetch complete product data for candidate IDs
  const products = await prisma.product.findMany({
    where: {
      id: { in: candidateIds },
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      category: true,
      brand: true,
      variants: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  // 6. Context-Aware Re-ranking and Filtering using LangChain Groq AI Analysis
  let filteredProducts = products;

  if (groqAnalysis) {
    const keywords = (groqAnalysis.searchKeywords || []).map((k) =>
      k.toLowerCase()
    );
    const productType = (groqAnalysis.productType || "").toLowerCase();
    const category = (groqAnalysis.category || "").toLowerCase();

    // Strict semantic filter: Keep products matching the detected item type, category, or keywords
    const contextualMatches = products.filter((product) => {
      const fullText = `${product.name} ${product.description || ""} ${
        product.category?.name || ""
      }`.toLowerCase();

      const typeMatch = productType && fullText.includes(productType);
      const categoryMatch = category && fullText.includes(category);
      const keywordMatch = keywords.some((kw) => fullText.includes(kw));

      return typeMatch || categoryMatch || keywordMatch;
    });

    if (contextualMatches.length > 0) {
      filteredProducts = contextualMatches;
    }
  }

  // 7. Calculate score & sort
  const sortedProducts = filteredProducts
    .map((product) => {
      const baseSim = similarityMap.get(product.id) || 0;
      let scoreBoost = 0;

      if (groqAnalysis) {
        const text = `${product.name} ${product.description || ""} ${
          product.category?.name || ""
        }`.toLowerCase();
        if (
          groqAnalysis.productType &&
          text.includes(groqAnalysis.productType.toLowerCase())
        ) {
          scoreBoost += 0.25;
        }
        for (const kw of groqAnalysis.searchKeywords || []) {
          if (text.includes(kw.toLowerCase())) {
            scoreBoost += 0.1;
          }
        }
      }

      const finalScore = Math.min(0.99, Math.max(0.1, baseSim * 0.5 + scoreBoost + 0.3));

      return {
        ...product,
        similarityScore: Math.round(finalScore * 100) / 100,
      };
    })
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    .slice(0, limit);

  return {
    products: sortedProducts,
    analysis: groqAnalysis,
    totalFound: sortedProducts.length,
  };
}

/**
 * Backfill vector embeddings for all ProductImage records missing embeddings
 */
export async function backfillProductEmbeddings(): Promise<{ processed: number; success: number; failed: number }> {
  console.log("Starting backfill for missing product image embeddings...");

  // Get product images missing embedding
  const images: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, url FROM "ProductImage" WHERE embedding IS NULL LIMIT 200
  `);

  let success = 0;
  let failed = 0;

  for (const img of images) {
    const ok = await saveImageEmbedding(img.id, img.url);
    if (ok) success++;
    else failed++;
  }

  console.log(`Backfill finished. Processed: ${images.length}, Success: ${success}, Failed: ${failed}`);
  return { processed: images.length, success, failed };
}
