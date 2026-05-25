const path = require("path");

module.exports = {
  mode: "development",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
    extensions: [".ts", ".js"],
  },
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
