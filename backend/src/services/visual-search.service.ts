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
  // 1. Generate query embedding vector
  const queryEmbedding = await generateImageEmbedding(imageUrlOrBuffer);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // 2. Perform Groq visual analysis if a public image URL is available
  let groqAnalysis: GroqVisualAnalysis | null = null;
  if (imageUrlForGroq) {
    try {
      groqAnalysis = await analyzeImageWithGroq(imageUrlForGroq);
    } catch (e) {
      console.warn("Groq visual analysis skipped:", e);
    }
  }

  // 3. Vector similarity search in PostgreSQL via pgvector
  // Cosine distance <=> operator (lower distance = higher similarity)
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
    limit
  );

  if (!rawResults || rawResults.length === 0) {
    return { products: [], analysis: groqAnalysis, totalFound: 0 };
  }

  const productIds = rawResults.map((r) => r.productId);
  const similarityMap = new Map(rawResults.map((r) => [r.productId, Number(r.similarity)]));

  // 4. Fetch complete product data for the matched IDs
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
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

  // Sort returned products to preserve vector similarity order
  const sortedProducts = products
    .map((product) => ({
      ...product,
      similarityScore: Math.round((similarityMap.get(product.id) || 0) * 100) / 100,
    }))
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));

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
