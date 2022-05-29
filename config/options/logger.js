import config from "../../configuration.js"
export default () => {
    return config('HEROKU')
        ? true
        : {
              file: './logs/all.log',
              redact: ['req.headers.authorization', 'req.headers.cookie'],
              serializers: {
                  req(request) {
                      return {
                          method: request.method,
                          url: request.url,
                          ...(request.headers['user-agent'] && {
                              useragent: request.headers['user-agent'].slice(0, 100),
                          }),
                          hostname: request.hostname,
                          remoteAddress: request.ip,
                          remotePort: request.socket.remotePort,
                          ingest: 'fluentd',
                      }
                  },
              },
          }
}
