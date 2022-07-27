const NODE_ENV = {
    api: -1,
    localhost: 0,
    production: 1,
}[process.env.NODE_ENV]

export default () => {
    return NODE_ENV < 1 
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
