import cluster from 'cluster'
// Require app configurations
import { config } from 'dotenv'
import os from 'os'
import build from './app.js'

config()
process.title = process.env['APP_NAME']

// !!CLUSTER SETUP!!
if (process.env.NO_CLUSTER) {
    process.env.worker_id = '1'
    build(true)
} else {
    const CPUS = os.cpus().length - 1

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
