#!/usr/bin/env node
'use strict';

var restify = require('restify');
var extend = require('deep-extend');
//var app = require('../lib');
var pdfFac = require('../lib');

var pkg = require('../package.json');

// Get untrackable configurations.
try {
  extend(process.env, require('../config.json')); //eslint-disable-line global-require
} catch (err) {
  if (!err.message || err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

var serviceName = process.env.NAME || pkg.name;
var toPdf = pdfFac({
  command: process.env.CMD_PATH || 'wkhtmltopdf'
});

var server = restify.createServer({
  name: serviceName,
  version: '1.0.0'
});

server.use(restify.queryParser());
server.use(restify.gzipResponse());

server.post('/', restify.bodyParser(), function (req, res, next) {
  var html = req.body && req.body.html;

  if (!html) {
    return next(new Error('No HTML body given.'));
  }

  Object.getOwnPropertyNames(req.query).forEach(i => {
    let t = req.query[i].toLowerCase();
    if (t === 'true' || t === 'false') {
      req.query[i] = t === 'true';
    }
  });

  toPdf(html, req.query, (err, out) => {
    if (err) {
      return next(err);
    }

    res.setHeader('content-type', 'application/pdf');
    res.send(out);
  });
});



server.listen(process.env.PORT || 15000, function () {
  console.log('%s server started at %s', server.name, server.url); //eslint-disable-line no-console
});
