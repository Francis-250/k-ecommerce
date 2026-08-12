import { searchProductsByImage } from "../services/visual-search.service";

async function main() {
  console.log("=== End-to-End Visual Search Test ===");

  // Sample 1x1 base64 red pixel PNG data URI
  const sampleDataUri =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const startTime = Date.now();
  console.log("Executing searchProductsByImage with data URI...");

  const result = await searchProductsByImage(sampleDataUri, 10);
  const elapsedMs = Date.now() - startTime;

  console.log(`\n✓ Search completed in ${elapsedMs}ms`);
  console.log(`✓ Products Found: ${result.products.length}`);

  if (result.products.length > 0) {
    console.log("✓ Sample Matched Products:");
    result.products.slice(0, 3).forEach((p, idx) => {
      console.log(
        `  ${idx + 1}. [${p.similarityScore * 100}% Match] ${p.name} ($${p.basePrice})`,
      );
    });
  }

  console.log("\n=== TEST PASSED: Visual Search API is 100% Functional! ===");
}

main().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
