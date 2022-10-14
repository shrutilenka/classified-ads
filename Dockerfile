FROM node:14.19.3-alpine3.14
WORKDIR /classified-ads

RUN apk add git curl
RUN mkdir -p other_apps && cd other_apps/ && rm -rf mylinks && git clone https://github.com/bacloud23/mylinks.git
RUN mkdir -p data/raw && curl https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt > data/raw/ipsum.txt

COPY package.json ./
RUN npm i -g npm
RUN rm -rf /node_modules

# Couldn't install Sharp, moving on with the project without Sharp !
# With some tweaks it can work ! (playing on FROM node:VERSION without hurting other dependencies)
# RUN npm install -g node-gyp
# vips-dev has moved from to edge/community, and updated to version 8.8.0-r0.
# RUN apk add --update --no-cache \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/community \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/main \
#     build-base vips-dev && npm i --verbose --unsafe-perm --ignore-scripts false sharp@0.28.3
# RUN chmod -R a+rwx node_modules/sharp

RUN npm i
# might need to run this or not (if only produced by decancer depending on OS)
# RUN chmod -R a+rwx node_modules/@vierofernando 
RUN chmod -R a+rwx node_modules/decancer
RUN chmod -R a+rwx node_modules/jimp-compact

COPY . ./

WORKDIR /classified-ads/client
COPY /client/package.json ./
#RUN rm -rf /node_modules
RUN npm i
RUN npm run build

WORKDIR /classified-ads
# EXPOSE 3000
CMD [ "npm", "run", "start" ]
