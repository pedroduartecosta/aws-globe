import * as esbuild from "esbuild";
import net from "net";
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
  const port = await new Promise(resolve => {
    const s = net.createServer();
    s.listen(8080, () => s.close(() => resolve(8080)));
    s.on("error", () => {
      const s2 = net.createServer();
      s2.listen(0, () => { const p = s2.address().port; s2.close(() => resolve(p)); });
    });
  });

  const ctx = await esbuild.context(config);
  await ctx.serve({ servedir: "dist", port });
  await ctx.watch();
  console.log(`\nDev server: http://localhost:${port}\n`);
} else {
  await esbuild.build(config);
}
