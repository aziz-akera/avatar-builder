import { build } from "bun";
import { existsSync, rmSync, cpSync, renameSync } from "fs";
import { resolve } from "path";
import packageJson from "../package.json";

const ROOT = resolve(import.meta.dir, "..");
const SRC_ROOT = resolve(ROOT, "src");
const DIST_ROOT = resolve(ROOT, "dist");
const ENTRY = resolve(SRC_ROOT, "index.tsx");

// Get all dependencies and peer dependencies to externalize
const externals = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
];

console.log("Building library...");
console.log(`Entry: ${ENTRY}`);
console.log(`Output: ${DIST_ROOT}`);

// Clean dist directory
if (existsSync(DIST_ROOT)) {
  rmSync(DIST_ROOT, { recursive: true, force: true });
}

// Build CommonJS version
console.log("\n📦 Building CommonJS bundle...");
const cjsResult = await build({
  entrypoints: [ENTRY],
  outdir: DIST_ROOT,
  target: "browser",
  format: "cjs",
  sourcemap: "external",
  minify: true,
  external: externals,
});

if (!cjsResult.success) {
  console.error("❌ CJS build failed:", cjsResult.logs);
  process.exit(1);
}

// Rename CJS output to index.js
const cjsOutput = cjsResult.outputs[0];
if (cjsOutput) {
  const cjsPath = resolve(DIST_ROOT, "index.js");
  renameSync(cjsOutput.path, cjsPath);
  console.log("✅ Renamed to dist/index.js");
}

// Build ESM version
console.log("📦 Building ESM bundle...");
const esmResult = await build({
  entrypoints: [ENTRY],
  outdir: DIST_ROOT,
  target: "browser",
  format: "esm",
  sourcemap: "external",
  minify: true,
  external: externals,
});

if (!esmResult.success) {
  console.error("❌ ESM build failed:", esmResult.logs);
  process.exit(1);
}

// Rename ESM output to index.esm.js
const esmOutput = esmResult.outputs[0];
if (esmOutput) {
  const esmPath = resolve(DIST_ROOT, "index.esm.js");
  renameSync(esmOutput.path, esmPath);
  console.log("✅ Renamed to dist/index.esm.js");
}

// Copy type definitions
console.log("📝 Copying type definitions...");
const typesPath = resolve(SRC_ROOT, "types.ts");
if (existsSync(typesPath)) {
  cpSync(typesPath, resolve(DIST_ROOT, "index.d.ts"));
  console.log("✅ Types copied to dist/index.d.ts");
} else {
  console.warn("⚠️  types.ts not found, skipping type definitions");
}

console.log("\n✅ Build complete!");
console.log(`   CJS: dist/index.js`);
console.log(`   ESM: dist/index.esm.js`);
console.log(`   Types: dist/index.d.ts`);

