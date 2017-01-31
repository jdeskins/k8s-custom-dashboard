var config = {
  entry: './index.js',

  output: {
    path:'./',
    filename: 'bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
}

module.exports = config;
