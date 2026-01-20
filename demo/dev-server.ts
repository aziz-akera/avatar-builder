import { serve, build, file } from "bun";
import { existsSync } from "fs";
import { resolve, dirname, extname } from "path";
import sass from "sass";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const PORT = parseInt(process.env.PORT || "8080");
const ROOT = resolve(import.meta.dir, "..");
const DEMO_ROOT = resolve(import.meta.dir);
const SRC_ROOT = resolve(ROOT, "src");
const DEMO_SRC = resolve(DEMO_ROOT, "src");

// Path alias mapping
function resolveAlias(importPath: string): string | null {
  if (importPath === "react-nice-avatar" || importPath === "react-nice-avatar/index") {
    return resolve(SRC_ROOT, "index.tsx");
  }
  if (importPath.startsWith("react-nice-avatar/")) {
    const relativePath = importPath.replace("react-nice-avatar/", "");
    const filePath = resolve(SRC_ROOT, relativePath);
    if (existsSync(filePath)) return filePath;
    // Try adding .tsx extension
    const tsxPath = resolve(SRC_ROOT, `${relativePath}.tsx`);
    if (existsSync(tsxPath)) return tsxPath;
    // Try index.tsx
    const indexPath = resolve(SRC_ROOT, relativePath, "index.tsx");
    if (existsSync(indexPath)) return indexPath;
  }
  return null;
}

// Compile SCSS to CSS
async function compileSCSS(filePath: string): Promise<string> {
  try {
    // Read the file and replace webpack aliases
    let fileContent = await Bun.file(filePath).text();
    
    // Replace ~shared-style/ with empty string since scss dir is in includePaths
    // sass will resolve it from the includePaths
    fileContent = fileContent.replace(/~shared-style\//g, "");
    
    // sass v1.x uses renderSync, v2.x+ uses compile
    let css: string;
    if (typeof (sass as any).compile === 'function') {
      // sass v2.x+
      const result = (sass as any).compileString(fileContent, {
        loadPaths: [
          resolve(DEMO_SRC, "scss"),
          resolve(DEMO_ROOT, "public"),
          resolve(DEMO_SRC, "App"),
          resolve(DEMO_SRC),
        ],
        url: filePath, // For relative imports
      });
      css = result.css.toString();
    } else {
      // sass v1.x
      const result = (sass as any).renderSync({
        data: fileContent,
        file: filePath,
        includePaths: [
          resolve(DEMO_SRC, "scss"),
          resolve(DEMO_ROOT, "public"),
          resolve(DEMO_SRC, "App"),
          resolve(DEMO_SRC),
        ],
      });
      css = result.css.toString();
    }

    // Process with PostCSS (Tailwind + Autoprefixer)
    const postcssResult = await postcss([
      tailwindcss(resolve(ROOT, "tailwind.config.js")),
      autoprefixer,
    ]).process(css, {
      from: filePath,
    });

    return postcssResult.css;
  } catch (error: any) {
    console.error(`Error compiling SCSS ${filePath}:`, error.message);
    return `/* Error compiling SCSS: ${error.message} */`;
  }
}

// Get HTML with injected scripts and styles
async function getHTML(): Promise<string> {
  const htmlPath = resolve(DEMO_ROOT, "app.template.html");
  const html = await Bun.file(htmlPath).text();

  // First compile theme-v2.css (which includes Tailwind)
  const themePath = resolve(DEMO_SRC, "theme-v2.css");
  let themeCSS = "";
  if (existsSync(themePath)) {
    try {
      console.log("🎨 Compiling theme.css (Tailwind)...");
      const themeContent = await Bun.file(themePath).text();
      // Process theme.css with PostCSS (Tailwind processes @tailwind directives)
      const themeResult = await postcss([
        tailwindcss(resolve(ROOT, "tailwind.config.js")),
        autoprefixer,
      ]).process(themeContent, {
        from: themePath,
      });
      themeCSS = themeResult.css;
      console.log(`✅ Theme compiled (${themeCSS.length} bytes)`);
    } catch (error: any) {
      console.error("❌ Failed to compile theme.css:", error.message);
      console.error(error.stack);
    }
  }

  // Compile all SCSS files
  const scssFiles = [
    resolve(DEMO_SRC, "index.scss"),
    resolve(DEMO_SRC, "App", "index.scss"),
    resolve(DEMO_SRC, "App", "AvatarEditor", "index.scss"),
    resolve(DEMO_SRC, "App", "AvatarEditor", "SectionWrapper", "index.scss"),
    resolve(DEMO_SRC, "App", "AvatarList", "index.scss"),
  ];

  let allCSS = "";
  
  // Compile each SCSS file
  for (const scssPath of scssFiles) {
    if (existsSync(scssPath)) {
      try {
        console.log(`🎨 Compiling SCSS: ${scssPath.replace(DEMO_SRC + "/", "")}`);
        const compiled = await compileSCSS(scssPath);
        allCSS += `\n/* ${scssPath.replace(DEMO_SRC + "/", "")} */\n${compiled}\n`;
        console.log(`✅ Compiled: ${scssPath.replace(DEMO_SRC + "/", "")} (${compiled.length} bytes)`);
      } catch (error: any) {
        console.error(`❌ Failed to compile ${scssPath}:`, error.message);
        console.error(error.stack);
      }
    } else {
      console.warn(`⚠️  SCSS file not found: ${scssPath}`);
    }
  }

  return html.replace(
    "</head>",
    `
    <style>${themeCSS}</style>
    <style>${allCSS}</style>
    </head>`
  ).replace(
    "</body>",
    `
    <script type="module" src="/app.js"></script>
    <script>
      // Error handler for debugging
      window.addEventListener('error', (e) => {
        console.error('Global error:', e.error, e.filename, e.lineno);
        document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>JavaScript Error</h1><pre>' + e.error + '</pre></div>';
      });
      window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
      });
      // Check if app loaded
      setTimeout(() => {
        if (!document.querySelector('#app')?.hasChildNodes()) {
          console.warn('App did not render - check console for errors');
        }
      }, 1000);
    </script>
    </body>`
  );
}

// Build the app bundle
let appBundleCache: string | null = null;
let appBundleTime = 0;

async function buildAppBundle(): Promise<string> {
  const entryPath = resolve(DEMO_SRC, "index.tsx");
  const entryStat = await Bun.file(entryPath).stat();
  const mtime = entryStat.mtime?.getTime() || 0;

  // Cache invalidation - rebuild if file changed
  if (appBundleCache && mtime <= appBundleTime) {
    return appBundleCache;
  }

  try {
    const result = await build({
      entrypoints: [entryPath],
      target: "browser",
      format: "esm",
      sourcemap: "inline",
      define: {
        "process.env.NODE_ENV": '"development"',
      },
      external: [], // Bundle everything for development
      plugins: [
        {
          name: "resolve-alias",
          setup(builder) {
            builder.onResolve({ filter: /^react-nice-avatar/ }, (args) => {
              const resolved = resolveAlias(args.path);
              if (resolved) {
                return { path: resolved };
              }
              return undefined;
            });
          },
        },
        {
          name: "remove-hot-loader",
          setup(builder) {
            // Remove react-hot-loader imports
            builder.onLoad({ filter: /.*/, namespace: "file" }, async (args) => {
              if (args.path.includes("App/index.tsx")) {
                const file = Bun.file(args.path);
                const content = await file.text();
                const transformed = content
                  .replace(/import\s+{\s*hot\s*}\s+from\s+["']react-hot-loader["'];?\n?/g, "")
                  .replace(/export\s+default\s+hot\(module\)\(App\);?/g, "export default App;")
                  .replace(/require\(['"]\.\/index\.scss['"]\);?\n?/g, "");
                
                return {
                  loader: "tsx",
                  contents: transformed,
                };
              }
              return undefined;
            });
          },
        },
        {
          name: "ignore-css",
          setup(builder) {
            // Ignore CSS/SCSS imports in JS/TS files - we handle them separately
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

    if (!result.success) {
      console.error("❌ Build failed!");
      console.error("Logs:", JSON.stringify(result.logs, null, 2));
      throw new Error(`Build error: ${JSON.stringify(result.logs)}`);
    }

    if (result.logs && result.logs.length > 0) {
      console.log("⚠️  Build warnings:");
      result.logs.forEach((log: any) => {
        if (log.level === "warning") {
          console.warn("  ", log.text);
        }
      });
    }

    let code = "";
    for (const output of result.outputs) {
      const text = await output.text();
      code += text;
      console.log(`✅ Output: ${output.path} (${text.length} bytes)`);
    }

    if (!code || code.length === 0) {
      throw new Error("Build produced empty output");
    }

    appBundleCache = code;
    appBundleTime = mtime;
    console.log(`✅ Bundle size: ${code.length} bytes`);
    return code;
  } catch (error: any) {
    console.error("Error bundling app:", error);
    throw error;
  }
}

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve HTML at root
    if (pathname === "/" || pathname === "/index.html") {
      try {
        console.log("📄 Serving HTML...");
        const html = await getHTML();
        console.log("✅ HTML generated successfully");
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (error: any) {
        console.error("❌ Error generating HTML:", error);
        return new Response(`<html><body><h1>Error generating HTML</h1><pre>${error.message}\n${error.stack}</pre></body></html>`, {
          status: 500,
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    // Handle the main app bundle
    if (pathname === "/app.js") {
      try {
        console.log("📦 Building app bundle...");
        const code = await buildAppBundle();
        console.log("✅ App bundle built successfully");
        return new Response(code, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "no-cache",
          },
        });
      } catch (error: any) {
        console.error("❌ Error building app bundle:", error);
        return new Response(
          `// Error: ${error.message}\nconsole.error(${JSON.stringify(error.message)});\nconsole.error(${JSON.stringify(error.stack)});`,
          {
            status: 200, // Return 200 so browser shows the error
            headers: {
              "Content-Type": "application/javascript",
            },
          }
        );
      }
    }

    // Handle SCSS files - compile to CSS
    if (pathname.endsWith(".scss") || pathname.endsWith(".css")) {
      let filePath: string;
      
      if (pathname.startsWith("/src/")) {
        filePath = resolve(DEMO_ROOT, pathname.substring(1));
      } else {
        filePath = resolve(DEMO_SRC, pathname.replace(/^\//, ""));
      }

      if (existsSync(filePath)) {
        try {
          const css = await compileSCSS(filePath);
          return new Response(css, {
            headers: {
              "Content-Type": "text/css",
              "Cache-Control": "no-cache",
            },
          });
        } catch (error: any) {
          return new Response(`/* Error: ${error.message} */`, {
            status: 500,
            headers: { "Content-Type": "text/css" },
          });
        }
      }
    }

    // Serve static files
    if (pathname.startsWith("/static/")) {
      const filePath = resolve(DEMO_ROOT, pathname.substring(1));
      if (existsSync(filePath)) {
        return new Response(Bun.file(filePath));
      }
    }

    // Serve public files (fonts, etc.)
    if (pathname.startsWith("/public/")) {
      const filePath = resolve(DEMO_ROOT, pathname.substring(1));
      if (existsSync(filePath)) {
        return new Response(Bun.file(filePath));
      }
    }

    // Handle TypeScript/TSX source files (for source maps)
    if (pathname.match(/\.(ts|tsx)$/)) {
      let filePath: string;
      
      if (pathname.startsWith("/src/")) {
        filePath = resolve(DEMO_ROOT, pathname.substring(1));
      } else if (pathname.includes("react-nice-avatar")) {
        const aliasResolved = resolveAlias(
          pathname.replace(/^\//, "").replace(/\.(ts|tsx)$/, "")
        );
        if (aliasResolved) {
          filePath = aliasResolved;
        } else {
          return new Response("Not found", { status: 404 });
        }
      } else {
        filePath = resolve(DEMO_SRC, pathname.replace(/^\//, ""));
      }

      if (existsSync(filePath)) {
        return new Response(Bun.file(filePath), {
          headers: {
            "Content-Type": filePath.endsWith(".tsx") || filePath.endsWith(".jsx")
              ? "application/javascript"
              : "application/typescript",
          },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`🚀 Bun dev server running at http://localhost:${PORT}`);
console.log(`   Serving demo from: ${DEMO_ROOT}`);

