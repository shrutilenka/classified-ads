const config = require('config')

module.exports = () => {
    return config.get('HEROKU') ? true : {
        file: "./logs/all.log",
        redact: ["req.headers.authorization", "req.headers.cookie"],
        serializers: {
            req(request) {
                return {
                    method: request.method,
                    url: request.url,
                    headers: request.headers,
                    hostname: request.hostname,
                    remoteAddress: request.ip,
                    remotePort: request.socket.remotePort,
                    ingest: 'fluentd'
                }
            },
        },
    }
}
