module.exports = {
    plugins: [
      require('postcss-base64')({
        extensions: ['.svg'],
        root: 'src/sass'
      }),
      require('autoprefixer')(),
      require('cssnano')(),
    ],
  }