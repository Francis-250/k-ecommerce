import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["app", "components", "features"];
const extensions = new Set([".ts", ".tsx", ".css"]);

async function rewrite(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewrite(path);
      continue;
    }
    if (!extensions.has(extname(entry.name))) continue;
    const source = await readFile(path, "utf8");
    const updated = source
      .replaceAll("@/components/coron/CoronShell", "@/components/storefront/StorefrontShell")
      .replaceAll("@/components/coron/Catalog", "@/components/storefront/ProductCatalog")
      .replaceAll("CoronShell", "StorefrontShell")
      .replaceAll("/coron/", "/storefront/")
      .replaceAll('"./data"', '"./catalog-data"')
      .replaceAll('"./coron.css"', '"./storefront.css"')
      .replaceAll('"./coron-auth.css"', '"./auth.css"');
    if (updated !== source) await writeFile(path, updated, "utf8");
  }
}

for (const root of roots) await rewrite(root);
