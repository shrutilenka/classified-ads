// TODO: remove __dirname for later ESM support
// TODO: /client could benefit ESM but needs to change script tags to <script type="module" src>
const path = require('path')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const WebpackBeforeBuildPlugin = require('before-build-webpack')

const dotenv = require('dotenv')
const envKeys = dotenv.config()

const paths = {
  dist: path.resolve(__dirname, 'dist'),
  public: path.resolve(__dirname, '..', 'public', 'javascripts')
}
const isDevEnv = ['development', 'localhost'].includes(process.env.NODE_ENV)
const devConfig = {
  mode: 'development',
  devtool: 'source-map'
}

const fetch = require('node-fetch')
const fs = require('fs')
const gjv = require('geojson-validation')

const downloadFile = async (url, path) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('WebpackBeforeBuildPlugin: \nURL not found or something:\n' + url)
  }
  const str = await res.text()
  const json = JSON.parse(str)
  fs.promises.writeFile(path, str)
  if (gjv.valid(json)) {
    return 'GEOJSON is valid:\n' + url
  } else {
    throw new Error('WebpackBeforeBuildPlugin: \nGEOJSON is not valid:\n' + url)
  }
}

module.exports = {
  entry: {
    main: './src/main.js',
    skills: './src/views/skills/skills.js',
    listing: './src/views/listings/listing.js',
    tags: './src/views/tags/tags.js',
    easteregg: './src/views/easteregg/easteregg.js'
  },
  output: {
    filename: '[name].js',
    path: paths.dist
  },
  // module: {
  //   // for earlier webpack versions
  //   rules: [{
  //     test: /\.json$/,
  //     loader: 'json-loader'
  //    }],
  // },
  module: {
    rules: [
      {
        test: /\.json5$/i,
        loader: 'json5-loader',
        type: 'javascript/auto'
      }
    ]
  },
  stats: {
    preset: 'normal',
    moduleTrace: true,
    errorDetails: true
  },
  ...(isDevEnv && devConfig),
  plugins: [
    new WebpackBeforeBuildPlugin(function (stats, callback) {
      console.log('Environment variables:\n')
      console.log(Object.keys(envKeys.parsed))
      console.log('WebpackBeforeBuildPlugin: \nDownloading some data-sets\n')
      const promise = downloadFile(process.env.BORDERS_FILE_URL, 'src/data/borders.json')
      const promise2 = downloadFile(process.env.STATES_FILE_URL, 'src/data/states.json')
      Promise.all([promise, promise2]).then((msg) => {
        console.log(msg)
        callback()
      }).catch(console.error)
    }),
    new FileManagerPlugin({
      events: {
        onStart: {},
        onEnd: {
          copy: [
            { source: 'dist', destination: paths.public },
            { source: 'src/data/borders.json', destination: '../data/geo/borders.json' },
            { source: 'src/data/states.json', destination: '../data/geo/states.json' }
          ]
        }
      },
      runTasksInSeries: false,
      runOnceInWatchMode: false
    }),
    new Dotenv()
  ]
}

/**
 * CSS files
 * simple-lightbox\dist\simpleLightbox.min
 * Todo
 * leaflet
 * 
 */