const webpack = require('webpack')
const now = new Date()

module.exports = {
  lintOnSave: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        VERSION: `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}`
      })
    ],
    output: {
      filename: '[name].[hash].js'
    },
    devServer: {
      disableHostCheck: true
    }
  }
}
