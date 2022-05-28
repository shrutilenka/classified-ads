import cluster from "cluster";
// Require app configurations
import { config } from "dotenv";
import os from "os";
import build from "./app.js";

config();
process.title = 'classified-ads'
// Incremental is better
const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2
}[process.env.NODE_ENV]


// !!CLUSTER SETUP!!
if(process.env.NO_CLUSTER) {
    process.env.worker_id = '1'
    build(true)
} else {

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
