const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");

const path = require("path");
const glob = require("glob");

const parts = require("./webpack.parts");

const PATHS = {
  app: path.join(__dirname, "src")
};

const commonConfig = merge([
  {
    output: {
      path: __dirname + "/dist",
      publicPath: "/",
      filename: "[name].[chunkhash].js"
    }
  },
  {
    plugins: [
      new CleanWebpackPlugin(["dist"]),
      new HtmlWebpackPlugin({
        title: "Webpack demo",
        template: "src/index.html"
      })
    ]
  },
  parts.loadJavaScript({ include: PATHS.app })
]);

const productionConfig = merge([
  {
    output: {
      chunkFilename: "[name].[chunkhash:4].js",
      filename: "[name].[chunkhash:4].js"
    }
  },
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()]
  }),

  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true })
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: "[name].[ext]"
    }
  }),
  parts.generateSourceMaps({ type: "source-map" }),
  {
    optimization: {
      splitChunks: {
        // cacheGroups: {
        //   commons: {
        //     test: /[\\/]node_modules[\\/]/,
        //     name: "vendor",
        //     chunks: "initial"
        //   }
        // }
        name: "vendor",
        chunks: "initial"
      }
    }
  }
]);

const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT
  }),
  parts.loadCSS(),
  parts.loadImages()
]);

module.exports = mode => {
  if (mode === "production") {
    return merge(commonConfig, productionConfig, { mode });
  }

  return merge(commonConfig, developmentConfig, { mode });
};
