#!/usr/bin/env node

const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const proxy = require('http-proxy-middleware');
const createCertificate = require('./lib/createCertificate');

process.env["NODE_CONFIG_DIR"] = process.env["NODE_CONFIG_DIR"] || __dirname + "/config";
console.debug('using config dir:', process.env["NODE_CONFIG_DIR"]);

process.env["NODE_ENV"] = process.env["NODE_ENV"] || 'development';
console.debug('node env:', process.env["NODE_ENV"]);
console.debug('node app instance:', process.env["NODE_APP_INSTANCE"] || '');

const config = require('config');

const httpsOptions = function () {
    const certPath = path.join(__dirname, './ssl/server.pem');

    if (!fs.existsSync(certPath)) {
        const attrs = [
            {name: 'commonName', value: 'localhost'}
        ];

        const pems = createCertificate(attrs);
        fs.writeFileSync(certPath, pems.private + pems.cert, {encoding: 'utf-8'});
    }

    const cert = fs.readFileSync(certPath);

    return {
        key: cert,
        cert: cert
    };
};

console.debug('dev-proxy-server: starting using config:', JSON.stringify(config, null, 2));
const app = express();

const routes = config.util.toObject(config['proxy'] || {});
Object.getOwnPropertyNames(routes).forEach(path => {
    'use strict';
    const options = config.util.toObject(config.get(`proxy.${path}`));
    console.info('dev-proxy-server: adding proxy route:', path, '->', JSON.stringify(options, null, 2));
    app.use(proxy(path, options));
});

const port = config['port'] || 3000;
if (config.get('https')) {
    https.createServer(httpsOptions(), app).listen(port);
    console.info(`dev-proxy-server: listening for https on port: ${port}`);

} else {
    app.listen(port);
    console.info(`dev-proxy-server: listening for http on port: ${port}`);
}

