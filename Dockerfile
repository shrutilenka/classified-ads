FROM node:14.19.3-alpine3.14

WORKDIR /classified-ads
COPY package.json /classified-ads


RUN rm -rf /classified-ads/node_modules
RUN apk add --no-cache --update --virtual .gyp \
    build-base python3 go git && npm install @smodin/fast-text-language-detection annoy && apk del .gyp
# RUN npm run docker:build
RUN apk add git
RUN npm install -g npm
RUN npm install
COPY . /classified-ads

WORKDIR /classified-ads/client
COPY client/package.json /classified-ads/client
RUN npm install
RUN npm run dev:client

WORKDIR /classified-ads
CMD [ "npm", "run", "start" ]