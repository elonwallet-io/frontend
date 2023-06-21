FROM node:lts as build-env

WORKDIR /app

COPY . .

RUN yarn install && \
    yarn generate

FROM caddy:alpine

RUN rm -rf /usr/share/caddy/* && \
    rm -rf /etc/caddy/Caddyfile

COPY ./Caddyfile \
    /etc/caddy/Caddyfile

COPY --from=build-env \
    /app/.output/public \
    /usr/share/caddy