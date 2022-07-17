import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]
const filePath = '../../data/raw/ipsum.txt'
const textContent = fs.readFileSync(path.join(__dirname, filePath)).toString()
let ips = textContent.split('\n')
ips.pop()
let i = 0
while (ips.shift().indexOf('#') > -1) {}
ips = ips.map((line) => line.split('\t')[0])

// ips = ["100.1.108.246", "101.0.80.218", "101.108.122.200", "101.108.122.253", "101.108.208.235", "101.109.243.205", "101.109.253.90", "101.127.251.2", "101.13.0.15", "101.13.0.30"]
// Parse each line is like: '83.97.20.84\t3'
let blackBucket = {}
let whiteBucket = {}
function isIn(bucket, ip) {
    const intIp = ip.split('.').map(Number)
    var part1, part2, part3, part4
    ;[part1, part2, part3, part4] = intIp
    const thirdDeep = bucket[part1]?.[part2]?.[part3]
    if (!thirdDeep) return false
    return thirdDeep.indexOf(part4) > -1
}
// From node 15.14
// function pushToBucket(bucket, ip) {
//     const intIp = ip.split('.').map(Number)
//     var part1, part2, part3, part4
//     ;[part1, part2, part3, part4] = intIp

//     bucket[part1] ??= {}
//     bucket[part1][part2] ??= {}
//     const deep3 ??= bucket[part1][part2][part3] ??= []
//     if (deep3.indexOf(part4) < 0)
//         deep3.push(part4)
// }
function pushToBucket(bucket, ip) {
    const intIp = ip.split('.').map(Number)
    var part1, part2, part3, part4
    ;[part1, part2, part3, part4] = intIp

    if (!bucket[part1]) bucket[part1] = {}
    if (!bucket[part1][part2]) bucket[part1][part2] = {}
    if (!bucket[part1][part2][part3]) bucket[part1][part2][part3] = []
    if (bucket[part1][part2][part3].indexOf(part4) < 0) bucket[part1][part2][part3].push(part4)
}

// Fill in blackBucket at startup
for (let ip of ips) {
    pushToBucket(blackBucket, ip)
}

// const test1 = isIn(blackBucket, "100.1.108.246")
// const test2 = isIn(blackBucket, "100.1.108.240")
// console.log(`test1: ${test1}, test2: ${test2}`)

// Two checks are performed, one is ultra-fast IP lookup against a local blacklist
// The second hits 'projecthoneypot.org' API
function spamFilter(req, reply, done) {
    // TODO: req.socket ? does it work ?
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    req.log.info(ip)
    if (ip.substr(0, 7) === '::ffff:') {
        ip = ip.substr(7)
    }
    if (NODE_ENV <= 1 || ip.split('.')[0] === '127') {
        done()
        return
    }
    if (isIn(whiteBucket, ip)) {
        done()
        return
    }
    // Fast in-memory black list lookup
    if (isIn(blackBucket, ip)) {
        reply.send({ msg: 'site is under maintenance' })
        return
    }
    req.log.info(`${ip} bypassed`)
    // Honeypot
    // const reversedIp = ip.split('.').reverse().join('.')
    // dns.resolve4([process.env.HONEYPOT_KEY, reversedIp, 'dnsbl.httpbl.org'].join('.'), function (err, addresses) {
    //     if (!addresses) {
    //         done()
    //         return
    //     } else {
    //         const _response = addresses.toString().split('.').map(Number)
    //         // https://www.projecthoneypot.org/threat_info.php
    //         const test = _response[0] === 127 && _response[2] > 50
    //         if (test) {
    //             reply.send({ msg: 'site is under maintenance' })
    //             return
    //         }
    //         pushToBucket(whiteBucket, ip)
    //         done()
    //         return
    //     }
    // })
    done()
}

export default spamFilter
