const path = require("path");

module.exports = {
  mode: "production",
  resolve: {
    alias: {
      "satellite.js$": path.resolve(__dirname, "src/satellite-browser.js"),
    },
    extensions: [".ts", ".js"],
  },
  entry: ["./src/main.ts"],
  devtool: "source-map",
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
    path: path.resolve(__dirname, ""),
  },
};
