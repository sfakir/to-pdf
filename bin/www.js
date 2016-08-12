#!/usr/bin/env node
'use strict';

var restify = require('restify');
var extend  = require('deep-extend');
var q       = require('q');
var fs      = require('fs');
var path    = require('path');
var mkdirp  = require('mkdirp');
var md5     = require('md5');
var wkBin   = require('wkhtmltopdf-installer');
var pdfFac  = require('../lib');

var ebTestReg = /^\/tmp\/deployment\/application/;
var isEB      = ebTestReg.test(wkBin.path);
if (isEB) { // in EB
  wkBin.path = wkBin.path.replace(ebTestReg, path.normalize(path.join(__dirname, '..')));
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
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    return next();
  }
);

server.use(restify.queryParser());
if (!isEB) {
  server.use(restify.gzipResponse());
}

/**
 * Gets sections which need temporary files on FS and saves them
 *
 * @param {...string[]} [sections] header and footer and any other sections requiring temporary html document creation
 * @return {q.Promise[]} Array of promises
 */
const tempFiles = function (sections) {
  var hfProms = [];
  var time    = Date.now();
  sections    = Array.prototype.slice.call(arguments);
  sections.forEach(function (s) {
    var sPath = path.join(tmpDir, md5(s) + '-' + time + '.html');
    hfProms.push(writeFile(sPath, s).then(function () {
      return sPath;
    }));
  });
  return hfProms;
};

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

    var hfProms = tempFiles(header, footer);

    q.all(hfProms)
      .spread(function (headerPath, footerPath) {
        if (header) {
          req.query.headerHtml = headerPath;
        }
        if (footer) {
          req.query.footerHtml = footerPath;
        }

        toPdf(html, req.query, (err, out) => {
          if (err) {
            next(err);
          } else {

            res.setHeader('content-type', 'application/pdf');
            res.send(out);

            if (headerPath) {
              fs.unlink(headerPath);
            }
            if (footerPath) {
              fs.unlink(footerPath);
            }
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
