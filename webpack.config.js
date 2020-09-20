const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode == "production";

  const js = {
    test: /\.(jsx?)$/,
    loader: "babel-loader",
    exclude: /.+\/node_modules\/.+/
  };

  const css = {
    test: /\.(css)$/,
    use: [isProduction ? MiniCssExtractPlugin.loader : "style-loader"].concat([
      {
        loader: "css-loader",
        options: {
          modules: true,
          camelCase: true,
          importLoaders: 1,
          localIdentName: "a-[name]-[local]"
        }
      },
      {
        loader: "postcss-loader",
        options: {
          sourceMap: true
        }
      }
    ])
  };

  const images = {
    test: /\.(png|jp(e)?g)$/,
    use: [
      {
        loader: "responsive-loader",
        options: {
          name: "[name]-[hash]-[width].[ext]",
          sizes: [300, 600, 1200, 2000],
          quality: 95,
          placeholder: true,
          placeholderSize: 50
        }
      }
    ]
  };

  const files = {
    test: /\.(mp4|webm|gif|ttf|otf|woff(2)?|eot)$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name: "[name]-[hash].[ext]",
          outputPath: "assets/files/"
        }
      }
    ]
  };

  const html = {
    test: /\.html$/,
    use: [
      {
        loader: "html-loader",
        options: { minimize: true }
      }
    ]
  };

  const optimization = isProduction
    ? {
        minimizer: [
          new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
          }),
          new OptimizeCSSAssetsPlugin({})
        ]
      }
    : {};

  const plugins = [
    new Dotenv(),
    new CleanWebpackPlugin(["dist/*"]),
    new MiniCssExtractPlugin({
      filename: "assets/[contenthash]-[name].css"
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new webpack.HotModuleReplacementPlugin()
  ];

  return {
    devtool: isProduction ? "source-map" : "eval-source-map",
    entry: { app: "./src/index.js" },
    output: {
      path: path.join(__dirname, "dist"),
      libraryTarget: "umd",
      publicPath: "/",
      filename: "assets/[hash]-[name].js",
      chunkFilename: "assets/[hash]-[name].[id].chunk.js"
    },
    resolve: {
      extensions: [".js", ".jsx", ".json"],
      alias: {}
    },
    module: {
      rules: [js, css, images, files, html]
    },
    optimization,
    plugins,
    watch: !isProduction,
    watchOptions: {
      ignored: ["**/node_modules/**", ".git"],
      poll: 1000
    },
    devServer: {
      port: 8070,
      historyApiFallback: true,
      hot: true
    }
  };
};
