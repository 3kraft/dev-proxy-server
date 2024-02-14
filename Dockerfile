FROM node:20-alpine

EXPOSE 3000

WORKDIR /usr/src/app

ADD package*.json dev-proxy-server.js README.md ./
ADD lib/* lib/
ADD ssl/* ssl/
ADD config/default.yaml config/custom-environment-variables.yaml config/

RUN npm install
RUN npm link

ENTRYPOINT ["dev-proxy-server"]
