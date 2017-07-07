const childProcess = require('child_process');
const webpack = require('webpack');

const env = process.env.WEBPACK_ENV || 'dev';
const name = 'reach';
const umd = {
  entry: './src/index.js',
  output: {
    filename: `dist/${name}.min.js`,
    library: name,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
    ],
  },
  node: {
    Buffer: false,
  },
  externals: [
    {
      fs: 'commonjs fs', // a is not external
      https: 'commonjs https',
      http: 'commonjs http',
      url: 'commonjs url',
      'form-data': 'commonjs form-data',
    },
  ],
  plugins: [],
};
if (env !== 'dev') {
  umd.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    },
  }));
}
if (env === 'dev') {
  childProcess.exec('npm run test', (error, stdout, stderr) => {
    console.log(error || stdout || stderr);
  });
}
module.exports = umd;
