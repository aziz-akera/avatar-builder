import { build } from "bun";
import { existsSync, rmSync, readFileSync, writeFileSync, cpSync } from "fs";
import { resolve } from "path";
import sass from "sass";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const ROOT = resolve(import.meta.dir, "..");
const DEMO_ROOT = resolve(ROOT, "demo");
const DEMO_SRC = resolve(DEMO_ROOT, "src");
const DEMO_DIST = resolve(DEMO_ROOT, "dist");
const ENTRY = resolve(DEMO_SRC, "index.tsx");
const HTML_TEMPLATE = resolve(DEMO_ROOT, "app.template.html");

console.log("Building demo...");
console.log(`Entry: ${ENTRY}`);
console.log(`Output: ${DEMO_DIST}`);

// Clean dist directory
if (existsSync(DEMO_DIST)) {
  rmSync(DEMO_DIST, { recursive: true, force: true });
}

// Build JavaScript bundle
console.log("\n📦 Building JavaScript bundle...");
const buildResult = await build({
  entrypoints: [ENTRY],
  outdir: DEMO_DIST,
  target: "browser",
  format: "esm",
  sourcemap: false,
  minify: true,
  external: ["react", "react-dom"], // These should be available in production
  plugins: [
    {
      name: "resolve-alias",
      setup(builder) {
        builder.onResolve({ filter: /^react-nice-avatar/ }, (args) => {
          const resolved = resolve(ROOT, "src", args.path.replace("react-nice-avatar", "").replace(/^\//, "") || "index.tsx");
          if (existsSync(resolved)) {
            return { path: resolved };
          }
          return undefined;
        });
      },
    },
    {
      name: "remove-hot-loader",
      setup(builder) {
        builder.onLoad({ filter: /.*/, namespace: "file" }, (args) => {
          if (args.path.includes("App/index.tsx")) {
            return {
              loader: "tsx",
              contents: readFileSync(args.path, "utf-8")
                .replace(/import\s+{\s*hot\s*}\s+from\s+["']react-hot-loader["'];?\n?/g, "")
                .replace(/export\s+default\s+hot\(module\)\(App\);?/g, "export default App;")
                .replace(/require\(['"]\.\/index\.scss['"]\);?\n?/g, ""),
            };
          }
          return undefined;
        });
      },
    },
    {
      name: "ignore-css",
      setup(builder) {
        builder.onResolve({ filter: /\.(css|scss)$/ }, () => {
          return { path: "__bun_ignore__", namespace: "bun-ignore" };
        });
        builder.onLoad({ filter: /.*/, namespace: "bun-ignore" }, () => {
          return { contents: "", loader: "js" };
        });
      },
    },
  ],
});

if (!buildResult.success) {
  console.error("❌ Build failed:", buildResult.logs);
  process.exit(1);
}

// Compile SCSS
console.log("🎨 Compiling SCSS...");
const scssPath = resolve(DEMO_SRC, "index.scss");
let css = "";
if (existsSync(scssPath)) {
  try {
    // sass v1.x uses renderSync, v2.x+ uses compile
    let scssCss: string;
    if (typeof (sass as any).compile === 'function') {
      // sass v2.x+
      const result = (sass as any).compile(scssPath, {
        loadPaths: [
          resolve(DEMO_SRC, "scss"),
          resolve(DEMO_ROOT, "public"),
          resolve(DEMO_SRC, "App"),
        ],
      });
      scssCss = result.css.toString();
    } else {
      // sass v1.x
      const result = (sass as any).renderSync({
        file: scssPath,
        includePaths: [
          resolve(DEMO_SRC, "scss"),
          resolve(DEMO_ROOT, "public"),
          resolve(DEMO_SRC, "App"),
        ],
      });
      scssCss = result.css.toString();
    }

    // Process with PostCSS
    const postcssResult = await postcss([
      tailwindcss(resolve(ROOT, "tailwind.config.js")),
      autoprefixer,
    ]).process(scssCss, {
      from: scssPath,
    });

    css = postcssResult.css;
  } catch (error: any) {
    console.error("❌ SCSS compilation failed:", error.message);
    process.exit(1);
  }
}

// Compile Tailwind
console.log("🎨 Compiling Tailwind CSS...");
const tailwindInput = `@tailwind base; @tailwind components; @tailwind utilities;`;
const tailwindCSS = await postcss([
  tailwindcss(resolve(ROOT, "tailwind.config.js")),
  autoprefixer,
]).process(tailwindInput, { from: undefined });

// Generate HTML
console.log("📄 Generating HTML...");
let html = readFileSync(HTML_TEMPLATE, "utf-8");

// Inject CSS
html = html.replace(
  "</head>",
  `
    <style>${tailwindCSS.css}</style>
    <style>${css}</style>
    </head>`
);

// Inject JavaScript bundle
const jsFiles = buildResult.outputs.map((output) => output.path);
const mainJsFile = jsFiles.find((f) => f.endsWith(".js")) || jsFiles[0];
const jsPath = "/" + mainJsFile.replace(DEMO_DIST + "/", "");

html = html.replace(
  "</body>",
  `
    <script type="module" src="${jsPath}"></script>
    </body>`
);

writeFileSync(resolve(DEMO_DIST, "index.html"), html);

// Copy static files
console.log("📋 Copying static files...");
const staticDir = resolve(DEMO_ROOT, "static");
if (existsSync(staticDir)) {
  cpSync(staticDir, resolve(DEMO_DIST, "static"), { recursive: true });
}

console.log("\n✅ Demo build complete!");
console.log(`   Output: ${DEMO_DIST}`);

