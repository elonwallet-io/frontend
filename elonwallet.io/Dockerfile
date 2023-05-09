FROM node:lts as build-env

WORKDIR /app

COPY . .

RUN yarn install && \
    yarn generate

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/nginx.conf

COPY ./nginx.conf \
    /etc/nginx/nginx.conf

COPY --from=build-env \
    /app/.output/public \
    /usr/share/nginx/html