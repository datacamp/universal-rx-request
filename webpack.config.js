module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: './lib',
    filename: 'index.js',
    library: 'rxRequest',
    libraryTarget: 'umd',
  },
  externals: [/^rxjs.*/, 'superagent'],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
    }],
  },
};
