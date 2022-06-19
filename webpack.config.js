const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isOffline = !!slsw.lib.webpack.isLocal;

if (isOffline) {
  // eslint-disable-next-line no-console
  console.log("Offline mode detected!");
}

// Add plugins for the offline mode here
const offlinePlugins = [];

module.exports = {
  entry: slsw.lib.entries,
  mode: isOffline ? "development" : "production",
  target: "node",
  devtool: "source-map",
  externals: [nodeExternals()],
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
    sourceMapFilename: "[file].map",
  },
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  optimization: {
    minimize: !isOffline,
    concatenateModules: false,
  },
  plugins: [
    ...(isOffline ? offlinePlugins : []),
    new CopyWebpackPlugin({
      patterns: [{ from: "./prisma", to: "prisma" }],
    }),
  ],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
