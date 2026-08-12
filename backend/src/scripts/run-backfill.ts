import { backfillProductEmbeddings } from "../services/visual-search.service";

async function main() {
  console.log("Running initial backfill of product embeddings...");
  const res = await backfillProductEmbeddings();
  console.log("Backfill result:", res);
}

main().catch(console.error);
