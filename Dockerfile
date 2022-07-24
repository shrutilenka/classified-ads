FROM node:14.19.3-alpine3.14
WORKDIR /classified-ads

RUN apk add git
RUN cd ./other_apps/ && rm -rf so-cards && git clone https://github.com/bacloud22/so-cards.git
RUN https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt > /data/raw/ipsum.txt

COPY package.json ./
RUN npm i -g npm
RUN rm -rf /node_modules

RUN apk add --no-cache --update --virtual .gyp \
    build-base vips-dev python3 go && npm i @smodin/fast-text-language-detection annoy && \
    apk del .gyp

# Couldn't install Sharp, moving on with the project without Sharp !
# RUN npm install -g node-gyp
# vips-dev has moved from to edge/community, and updated to version 8.8.0-r0.
# RUN apk add --update --no-cache \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/community \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/main \
#     build-base vips-dev && npm i --verbose --unsafe-perm --ignore-scripts false sharp@0.28.3

RUN npm i
#RUN chmod -R a+rwx node_modules/@msgpackr-extract
COPY . ./

WORKDIR /classified-ads/client
COPY /client/package.json ./
#RUN rm -rf /node_modules
RUN npm i
RUN rm -rf /.parcel-cache
RUN npm run build

WORKDIR /classified-ads
# EXPOSE 3000
CMD [ "npm", "run", "start" ]
