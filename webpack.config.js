const webpack = require('webpack');
const env = process.env.WEBPACK_ENV || 'dev';
const name = 'reach';

let options = {
  entry: './src/index.js',
  output: {
    filename: `dist/${name}.min.js`,
    library: 'Babbler',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  plugins: []
};

if( env !== 'dev' ){
  options.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    },
  }));
}

if( env === 'dev' ){
  require('child_process').exec('npm run test', function(error, stdout, stderr) {
    console.log(error || stdout || stderr);
  });
}

module.exports = options;