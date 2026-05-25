const path = require("path");

module.exports = {
  mode: "production",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
  },
  entry: ["./src/index.js"],
  devtool: "source-map",
  module: {
    rules: [
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
    path: path.resolve(__dirname, ""),
  },
};
