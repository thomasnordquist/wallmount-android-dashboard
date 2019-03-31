var path = require('path');
var webpack = require('webpack');
var LiveReloadPlugin = require('webpack-livereload-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
 
module.exports = {
  entry: './src/main',
  output: {
      path: __dirname + "/www",
      filename: 'main.js'
  },
  devServer: {
    host: '0.0.0.0',
    contentBase: __dirname + '/platforms/android/platform_www/',
  },
  devtool: 'source-map',
  plugins: [
    new LiveReloadPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html'
    }),
  ]
};
