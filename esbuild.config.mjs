import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes("--dev");

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "dist/main.js",
  platform: "browser",
  target: ["es2020"],
  alias: {
    "satellite.js": path.resolve(__dirname, "src/satellite-browser.js"),
  },
  // JSON files (e.g. typeface, region data) are inlined as JS objects
  // Image/font files are copied as assets and referenced by URL
  loader: {
    ".jpg": "file",
    ".jpeg": "file",
    ".png": "file",
  },
  assetNames: "assets/[name]-[hash]",
  sourcemap: isDev ? "inline" : true,
  minify: !isDev,
  logLevel: "info",
};

if (isDev) {
  const ctx = await esbuild.context(config);
  // Try preferred port, fall back to any free port if it's in use
  let port;
  try {
    ({ port } = await ctx.serve({ servedir: "dist", port: 8080 }));
  } catch {
    ({ port } = await ctx.serve({ servedir: "dist", port: 0 }));
  }
  await ctx.watch();
  console.log(`\nDev server: http://localhost:${port}\n`);
} else {
  await esbuild.build(config);
}
