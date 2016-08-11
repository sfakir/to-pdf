#!/usr/bin/env node
'use strict';

var restify   = require('restify');
var extend    = require('deep-extend');
var q         = require('q');
var fs        = require('fs');
var path      = require('path');
var mkdirp    = require('mkdirp');
var md5       = require('md5');
var wkBin = require('wkhtmltopdf-installer');
var pdfFac    = require('../lib');

var ebTestReg = /^\/tmp\/deployment\/application\//;
if (ebTestReg.test(wkBin.path)) { // in EB
  wkBin.path = wkBin.path.replace(ebTestReg, __dirname);
}

var pkg = require('../package.json');

// Get untrackable configurations.
try {
  extend(process.env, require('../config.json')); //eslint-disable-line global-require
} catch (err) {
  if (!err.message || err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

var writeFile   = q.nfbind(fs.writeFile);
var tmpDir      = process.env.TMP_DIR || path.join(__dirname, '..', '.tmp');
var serviceName = process.env.NAME || pkg.name;
var toPdf       = pdfFac({
  command: process.env.CMD_PATH || wkBin.path || 'wkhtmltopdf'
});

var server = restify.createServer({
  name:    serviceName,
  version: '1.0.0'
});


server.use(
  function crossOrigin (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

server.use(restify.queryParser());
server.use(restify.gzipResponse());

server.post('/', restify.bodyParser(), function (req, res, next) {
  var html   = req.body && req.body.html;
  var header = req.body && req.body.header;
  var footer = req.footer && req.body.footer;

  if (html) {
    Object.getOwnPropertyNames(req.query).forEach(i => {
      let t = req.query[i].toLowerCase();
      if (t === 'true' || t === 'false') {
        req.query[i] = t === 'true';
      }
    });

    var hfProms = [];
    var time    = Date.now();
    if (header) {
      var headerPath = path.join(tmpDir, md5(header) + '-' + time + '.html');
      hfProms.push(writeFile(headerPath, header).then(function () {
        return headerPath
      }));
      req.query['headerHtml'] = headerPath;
    }
    if (footer) {
      var footerPath = path.join(tmpDir, md5(footer) + '-' + time + '.html');
      hfProms.push(writeFile(footerPath, footer).then(function () {
        return headerPath
      }));
      req.query['footerHtml'] = footerPath;
    }

    q.all(hfProms)
      .done(function (paths) {
        toPdf(html, req.query, (err, out) => {
          if (err) {
            next(err);
          } else {

            res.setHeader('content-type', 'application/pdf');
            res.send(out);
            paths.forEach(function (p) {
              fs.unlink(p);
            });
          }
        });
      })
    ;

  } else {
    next(new Error('No HTML body given.'));
  }
});

mkdirp(tmpDir, function (err) {
  if (err) {
    console.log('Server not started, failed to make temporary directory'); //eslint-disable-line no-console
    throw err;
  }

  server.listen(process.env.PORT || 15000, function () {
    console.log('%s server started at %s', server.name, server.url); //eslint-disable-line no-console
  });

});
