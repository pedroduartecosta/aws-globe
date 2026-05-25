const path = require("path");
const { NormalModuleReplacementPlugin } = require("webpack");

module.exports = {
  mode: "development",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
    extensions: [".ts", ".js"],
    // webpack-dev-server 5.x pulls server-side Node.js modules into the
    // compilation graph. Mark every Node built-in as an empty stub so the
    // browser bundle doesn't fail trying to polyfill them.
    fallback: {
      assert: false,
      buffer: false,
      child_process: false,
      crypto: false,
      events: false,
      fs: false,
      "fs/promises": false,
      http: false,
      https: false,
      net: false,
      os: false,
      path: false,
      process: false,
      stream: false,
      string_decoder: false,
      tls: false,
      url: false,
      util: false,
      zlib: false,
    },
  },
  plugins: [
    // Strip node: URI prefix so the fallback map above can match the module names
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
