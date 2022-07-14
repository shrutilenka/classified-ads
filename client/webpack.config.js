import dotenv from 'dotenv'
import Dotenv from 'dotenv-webpack'
import FileManagerPlugin from 'filemanager-webpack-plugin'
import fs from 'fs'
import gjv from 'geojson-validation'
import { DuplicatesPlugin } from 'inspectpack/plugin/index.js'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'
// import WebpackFavicons from "webpack-favicons";

const envKeys = dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const paths = {
    dist: path.resolve(__dirname, 'dist'),
    public: path.resolve(__dirname, '..', 'public', 'javascripts'),
    cssImages: path.resolve(__dirname, '..', 'public', 'stylesheets', 'images'),
}
const isDevEnv = ['development', 'localhost'].includes(process.env.NODE_ENV)
const devConfig = {
    mode: 'development',
    devtool: 'source-map',
}

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

export default {
    entry: {
        main: './src/main.js',
        skills: './src/views/skills/skills.js',
        listing: './src/views/listings/listing.js',
        biglistings: './src/views/biglistings/biglists.js',
        tags: './src/views/tags/tags.js',
        easteregg: './src/views/easteregg/easteregg.js',
        chat: './src/views/chat/chat.js',
        weathervenue: './src/views/weathervenue/weathervenue.js',
    },
    output: {
        filename: '[name].js',
        path: paths.dist,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    stats: {
        preset: 'normal',
        moduleTrace: true,
        errorDetails: true,
    },
    ...(isDevEnv && devConfig),
    plugins: [
        // new WebpackBeforeBuildPlugin(function (stats, callback) {
        //     console.log('Environment variables:\n')
        //     console.log(Object.keys(envKeys.parsed))
        //     console.log('WebpackBeforeBuildPlugin: \nDownloading some data-sets\n')
        //     const promise = downloadFile(process.env.BORDERS_FILE_URL, 'src/data/borders.json')
        //     const promise2 = downloadFile(process.env.STATES_FILE_URL, 'src/data/states.min.json')
        //     Promise.all([promise, promise2])
        //         .then((msg) => {
        //             console.log(msg)
        //             callback()
        //         })
        //         .catch(console.error)
        // }),
        new DuplicatesPlugin(),
        new FileManagerPlugin({
            events: {
                onStart: {},
                onEnd: {
                    copy: [
                        { source: 'dist', destination: paths.public },
                        // { source: 'src/data/borders.json', destination: '../data/geo/borders.json' },
                        // { source: 'src/data/states.json', destination: '../data/geo/states.json' },
                        { source: 'node_modules/leaflet/dist/images', destination: paths.cssImages },
                    ],
                },
            },
            runTasksInSeries: false,
            runOnceInWatchMode: false,
        }),
        new Dotenv(),
        // new WebpackFavicons({
        //     src: 'assets/favicon.svg',
        //     path: 'img',
        //     background: '#000',
        //     theme_color: '#000',
        //     icons: {
        //         favicons: true,
        //     },
        // }),
    ],
}

/**
 * CSS files
 * simple-lightbox\dist\simpleLightbox.min
 * Todo
 * leaflet
 *
 */
