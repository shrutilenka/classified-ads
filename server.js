// Running the web-app as a cluster of processes has never been properly tested !
// It seems to me a possible option. But it is to be considered very carefully; 
// As functionalities generally related to "cache" like sessions, caching top searches, or other variables,
// would result to inconsistent app; Unless we take every cache to a shared memory like Redis (not the case now)
// This is why we are using the environment option "NO_CLUSTER" for now.

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
