const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

// all dependecies from app/package.json will be included in build/node_modules
const externals = Object.assign(
  require('./app/package.json').dependencies,
  require('./app/package.json').optionalDependencies
);

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react!ts-loader'
      },
      {
        test: /\.js(x?)$/,
        use: 'babel-loader',
        exclude: (modulePath) => (
          modulePath.match(/node_modules/)
            && !modulePath.match(/node_modules(\/|\\)cerebro-ui/)
            && !modulePath.match(/node_modules(\/|\\)material-dashboard-pro-react/)
      )
    },

      {
      test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
      use: ['url-loader']
    }]
  },
  output: {
    path: path.join(__dirname, 'app'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    modules: [
      path.join(__dirname, "app"),
      "node_modules",
      "node_modules/material-dashboard-pro-react/src"
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  mode: 'development',
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new CopyWebpackPlugin([{
      from: 'app/main/css/themes/*',
      to: './main/css/themes/[name].[ext]'
    }])
  ],
  externals: Object.keys(externals || {})
};
