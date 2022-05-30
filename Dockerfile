FROM node:16-alpine3.14
WORKDIR /classified-ads
#COPY package.json ./classified-ads
COPY . /classified-ads
RUN npm run docker:build
RUN npm install
WORKDIR /classified-ads/client
RUN npm install
RUN npm run dev:client