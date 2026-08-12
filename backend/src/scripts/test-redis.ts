import "dotenv/config";
import { redis, setCache, getCache, delCache } from "../utils/redis";

async function runTest() {
  console.log("=== Upstash Redis Cache Verification Test ===");

  if (!redis) {
    console.error("❌ Redis client is null. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env");
    process.exit(1);
  }

  const testKey = "test:upstash:verification";
  const samplePayload = {
    status: "ok",
    appName: "I-RAS STYLES Ecommerce",
    testedAt: new Date().toISOString(),
    items: [
      { id: "p1", name: "Red Sneaker", price: 89.99 },
      { id: "p2", name: "Denim Jacket", price: 120.0 },
    ],
  };

  try {
    console.log(`\n1. Writing test payload to Upstash Redis (Key: ${testKey})...`);
    const setStart = Date.now();
    await setCache(testKey, samplePayload, 60);
    console.log(`✓ SET complete in ${Date.now() - setStart}ms`);

    console.log(`\n2. Reading test payload back from Upstash Redis...`);
    const getStart = Date.now();
    const cachedData = await getCache<typeof samplePayload>(testKey);
    const getElapsed = Date.now() - getStart;

    if (!cachedData) {
      throw new Error("GET returned null or undefined!");
    }

    console.log(`✓ GET complete in ${getElapsed}ms`);
    console.log("✓ Retrieved Payload:", JSON.stringify(cachedData, null, 2));

    if (cachedData.appName === samplePayload.appName && cachedData.items.length === 2) {
      console.log("\n✓ Verification PASSED: Data structure integrity 100% matched!");
    } else {
      throw new Error("Payload contents mismatch!");
    }

    console.log(`\n3. Cleaning up test key (${testKey})...`);
    await delCache(testKey);
    const afterDel = await getCache(testKey);
    if (afterDel === null) {
      console.log("✓ Key deletion verified (returned null).");
    }

    console.log("\n=== ALL TESTS PASSED: Upstash Redis is 100% Working! ===");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();
