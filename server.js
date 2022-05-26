// Require app configurations
require('dotenv').config()
process.title = 'classified-ads'
// Incremental is better
const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2
}[process.env.NODE_ENV]

const build = require('./app')

// !!CLUSTER SETUP!!
if(process.env.NO_CLUSTER) {
    process.env.worker_id = '1'
    build(true)
} else {
    const os = require('os')
    const cluster = require('cluster')
    const CPUS = NODE_ENV < 1 ? 2 : os.cpus().length - 1
    
    if (cluster.isMaster) {
        for (let i = 0; i < CPUS; i++) {
            cluster.fork({ worker_id: String(i) })
        }
        cluster.on('exit', (worker) => {
            console.log(`worker ${worker.process.pid} died`)
        })
    } else {
        build(true)
    }    
}
