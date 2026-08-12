import { prisma } from "../lib/prisma";

async function main() {
  console.log("Setting up pgvector extension and column...");
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✓ pgvector extension enabled.");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductImage" 
      ADD COLUMN IF NOT EXISTS "embedding" vector(512);
    `);
    console.log("✓ ProductImage embedding column verified.");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProductImage_embedding_hnsw_idx" 
      ON "ProductImage" USING hnsw ("embedding" vector_cosine_ops);
    `);
    console.log("✓ HNSW vector index verified.");

    console.log("Vector DB initialization complete!");
  } catch (error) {
    console.error("Error setting up vector DB:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
