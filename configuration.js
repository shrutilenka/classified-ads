import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const config = require('config')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'
console.log(`Loading configuration from ${process.env['NODE_CONFIG_DIR']}`)

export default config
