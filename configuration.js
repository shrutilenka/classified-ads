import { config as dotenv } from 'dotenv'
import { createRequire } from 'module'
import path from 'path'
import pupa from 'pupa'
import { fileURLToPath } from 'url'
dotenv()
process.title = 'classified-ads'
const require = createRequire(import.meta.url)
const nodeConfig = require('config')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'
console.log(`Loading configuration from ${process.env['NODE_CONFIG_DIR']}`)
console.log(`Running on Node environment ?: ${process.env.NODE_ENV}`)

export default function config(key, secretValues) {
    const stringRes = JSON.stringify(nodeConfig.get(key))
    if (!secretValues) secretValues = {}
    Object.assign(secretValues, process.env)
    const objRes = JSON.parse(pupa(stringRes, secretValues))
    // console.log(`got key ${key} with value ${stringRes}`)
    return objRes
}
