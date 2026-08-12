import { generateImageEmbedding, analyzeImageWithGroq } from "../lib/vision";

async function test() {
  console.log("Testing image vector embedding generation...");
  const sampleImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff"; // Nike red sneaker
  
  const embedding = await generateImageEmbedding(sampleImageUrl);
  console.log("✓ Generated embedding vector length:", embedding.length);
  console.log("Sample values (first 5):", embedding.slice(0, 5));

  console.log("\nTesting Groq Vision analysis...");
  const groqAnalysis = await analyzeImageWithGroq(sampleImageUrl);
  console.log("✓ Groq Visual Analysis Result:", JSON.stringify(groqAnalysis, null, 2));
}

test().catch(console.error);
