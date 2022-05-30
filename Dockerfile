FROM node:14.19.3-alpine3.14

WORKDIR /classified-ads
COPY package.json /classified-ads


RUN rm -rf /classified-ads/node_modules
# RUN rm package-lock.json
RUN apk add --no-cache --update --virtual .gyp \
    build-base vips-dev python3 go git && npm install @smodin/fast-text-language-detection annoy && apk del .gyp
# RUN npm run docker:build
RUN apk add git
RUN npm install -g npm
RUN npm install
COPY . /classified-ads

WORKDIR /classified-ads/client
RUN rm -rf /classified-ads/node_modules
# RUN rm package-lock.json
COPY client/package.json /classified-ads/client
RUN npm install
RUN npm run dev:client

WORKDIR /classified-ads
EXPOSE 3000
CMD [ "npm", "run", "start" ]