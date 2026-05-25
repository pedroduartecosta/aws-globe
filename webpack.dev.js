const path = require("path");
const { NormalModuleReplacementPlugin } = require("webpack");

// Every Node.js built-in module. webpack-dev-server 5.x pulls its server
// code (Server.js, express, chokidar, etc.) into the webpack compilation
// graph. Stubbing all built-ins prevents the cascade of "can't resolve X"
// errors while keeping the actual browser bundle unaffected (these code
// paths are never executed in the browser).
const NODE_BUILTINS = [
  "_http_agent", "_http_client", "_http_common", "_http_incoming",
  "_http_outgoing", "_http_server",
  "_stream_duplex", "_stream_passthrough", "_stream_readable",
  "_stream_transform", "_stream_wrap", "_stream_writable",
  "_tls_common", "_tls_wrap",
  "assert", "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns", "dns/promises",
  "domain",
  "events",
  "fs", "fs/promises",
  "http", "http2",
  "https",
  "inspector", "inspector/promises",
  "module",
  "net",
  "os",
  "path", "path/posix", "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline", "readline/promises",
  "repl",
  "stream", "stream/consumers", "stream/promises", "stream/web",
  "string_decoder",
  "sys",
  "timers", "timers/promises",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util", "util/types",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
];

module.exports = {
  mode: "development",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
    extensions: [".ts", ".js"],
    fallback: Object.fromEntries(NODE_BUILTINS.map(m => [m, false])),
  },
  // Native .node binary addons (e.g. fsevents) cannot be parsed by webpack.
  // Mark them as externals so they're skipped — they're only used by the
  // dev-server process itself, never by the browser bundle.
  externals: [
    function ({ request }, callback) {
      if (request && /\.node$/.test(request)) {
        return callback(null, "var undefined");
      }
      callback();
    },
  ],
  plugins: [
    // Strip node: URI prefix so the fallback map above can match module names.
    new NormalModuleReplacementPlugin(/^node:/, resource => {
      resource.request = resource.request.replace(/^node:/, "");
    }),
  ],
  entry: ["./src/main.ts"],
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    open: false,
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|jpg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[path][name][ext]",
        },
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
