#!/usr/bin/env node
'use strict';

var restify = require('restify');
var extend = require('deep-extend');
//var app = require('../lib');
var pdfFac = require('../lib');

// Get untrackable configurations.
try {
  extend(process.env, require('../config.json'));
} catch (err) {
  if (!err.message || err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

var serviceName = process.env.NAME || require('../package.json').name;
var toPdf = pdfFac({
  command: process.env.CMD_PATH || '~/bin/wkhtmltopdf'
});

var server = restify.createServer({
  name: serviceName,
  version: '1.0.0'
});




server.post('/', restify.bodyParser(), function (req, res, next) {
  var opts = req.body || req.params;
  var html = opts.html;
  // Todo: Changed this, reflect changes in client

  if (opts.html) {
    delete opts.html;
  }

  toPdf.stream(html, opts)
    .pipe(res)
  ;
});



server.listen(process.env.PORT || 15000, function () {
  console.log('%s server started at %s', server.name, server.url);
});
