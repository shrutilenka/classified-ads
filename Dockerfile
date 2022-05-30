FROM node:16-alpine3.14
WORKDIR /classified-ads
COPY package.json /classified-ads
RUN npm run docker:build
RUN npm install
COPY . /classified-ads

WORKDIR /classified-ads/client
COPY client/package.json /classified-ads/client
RUN npm install
RUN npm run dev:client