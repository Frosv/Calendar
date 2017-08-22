const path = require('path'); //路径文件
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); //输入css文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); //html
const jquery = require('jquery');

//文件入口

const entry = './src/page/Calendar/index.js';

const template = './src/page/Calendar/index.html';


const config = {
  devtool: 'eval',
  entry: entry,
  output: {
    filename: 'js/[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist') //生成地址
  },
  devServer: {
    historyApiFallback: true,
    compress: true, //使用gzip压缩
    port: 9999, //端口号
    host: '0.0.0.0',
    disableHostCheck: true
  },
  module: {
    rules: [{
        test: require.resolve('jquery'),
        use: [
          'expose-loader?$',
          'expose-loader?jQuery'
        ]
      }, {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.(css|scss)$/, //匹配css
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!postcss-loader?id=css/[name].css'
        })
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader?name=static/images/[name].[ext]'
      },
      {
        test: /\.ttf\??.*$/,
        use: 'file-loader?name=static/fonts/[name].[ext]&minetype=application/octet-stream'
      },
      {
        test: /\.eot\??.*$/,
        use: 'file-loader?name=static/fonts/[name].[ext]'
      },
      {
        test: /\.svg\??.*$/,
        use: 'file-loader?name=static/fonts/[name].[ext]&minetype=image/svg+xml'
      },
      {
        test: /\.(woff|woff2)\??.*$/,
        use: 'file-loader?name=static/fonts/[name].[ext]&minetype=application/font-woff'
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'js/commons.js'
    }),
    // 全局 jquery
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    }),
    new HtmlWebpackPlugin({ //html注入文件插件
      filename: 'index.html', //文件名
      template: template, //渲染模板
      // chunks: ['app']
      // minify: { //压缩HTML
      //   removeComments: true,
      //   collapseWhitespace: true
      // }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   minimize: true
    // })//混淆压缩
  ]
};

module.exports = config;
