FROM caddy:2.5.2-builder-alpine AS builder

RUN xcaddy build \
    --with github.com/caddyserver/transform-encoder \
    --with github.com/porech/caddy-maxmind-geolocation

FROM caddy:2.5.2-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy