const path = require("path");
const { NormalModuleReplacementPlugin } = require("webpack");

module.exports = {
  mode: "development",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
    extensions: [".ts", ".js"],
  },
  plugins: [
    // webpack-dev-server 5.x uses node: URI imports; strip prefix so webpack can resolve them
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
