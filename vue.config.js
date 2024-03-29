const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const GenerateJsonFile = require('generate-json-file-webpack-plugin')
const WebpackPreBuildPlugin = require('pre-build-webpack')
const fs = require('fs')
const moment = require('moment')
const path = './src/build.info.json'
const buildTime = moment().toISOString()

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        mapboxgl: 'mapbox-gl'
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(
          moment(buildTime).format()
        )
      }),
      new GenerateJsonFile({
        filename: 'manifest.json',
        value: {
          buildTime
        }
      }),
      new WebpackPreBuildPlugin(stats => {
        if (!fs.existsSync(path)) {
          fs.writeFileSync(
            path,
            JSON.stringify({
              buildTime
            })
          )
        }
      }),
      new Dotenv()
    ],
    mode: 'development',
    target: 'web',
    output: {
      filename: '[name].[hash].js'
    },
    devServer: {
      disableHostCheck: true
    }
  }
}
