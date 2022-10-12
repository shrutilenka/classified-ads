import Dotenv from 'dotenv-webpack'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const paths = {
    public: path.resolve(__dirname, '..', 'public', 'javascripts'),
    cssImages: path.resolve(__dirname, '..', 'public', 'stylesheets', 'images'),
}

const isDevEnv = ['development', 'localhost'].includes(process.env.NODE_ENV)
const devConfig = {
    mode: 'development',
    devtool: 'source-map',
}

export default {
    entry: {
        index: './src/views/main/index.js',
        listing: './src/views/listings/listing.js',
        biglists: './src/views/biglistings/biglists.js',
        skills: './src/views/skills/skills.js',
        tags: './src/views/tags/tags.js',
        weathervenue: './src/views/weathervenue/weathervenue.js',
        easteregg: './src/views/easteregg/easteregg.js',
    },
    output: {
        filename: '[name]/[name].js',
        path: paths.public,
    },
    ...(isDevEnv && devConfig),
    plugins: [new Dotenv()],
    node: {
        __dirname: true,
    },
}
