'use strict';

var q      = require('q');
var extend = require('deep-extend');
var wkpdf  = require('wkhtmltopdf');
var error  = require('if-err');

/**
 * Look up options here** http://madalgo.au.dk/~jakobt/wkhtmltoxdoc/wkhtmltopdf_0.10.0_rc2-doc.html
 * **Use camelCase instead of snake-case
 */
var defOptions = {
  pageSize: 'Letter'
};

module.exports = function toPdfFac (facOptions) {
  facOptions = facOptions || {};
  var command;
  if (facOptions.command) {
    command = facOptions.command;
    delete facOptions.command;
  }


  var toPdf      = function (src, options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options  = {};
    }

    // Setup promise
    var d = q.defer();

    var chunks = [];
    toPdf
    // schluff off work to stream maker
      .stream(src, options)

      // buffer stream
      .on('data', function (chunk) {
        chunks.push(chunk);
      })

      // return resultant
      .on('end', function () {
        d.resolve(Buffer.concat(chunks));
      })

      // or return error
      .on('error', function (err) {
        d.reject(err); // Dunno how to get here
      })
    ;

    // promise or callback
    return d.promise.nodeify(callback);
  };
  toPdf.stream   = function toPdfStream (str, options) {
    error.ifNot(str, 'No URL or HTML string provided');
    error.ifNot(str.toString, 'str should be URL or HTML, in the form of a Buffer or String (or other #toString() interface)');

    options.debugJavascript = true;
    options.debug = true;

    var opts = extend({}, toPdf.defaults, options || {});
    if (!opts.orientation && opts.landscape) {
      opts.orientation = 'Landscape';
      delete opts.landscape;
    }



    return toPdf._wkpdf(str.toString(), opts);
  };
  toPdf.defaults = extend({}, defOptions, facOptions);
  toPdf._wkpdf   = wkpdf; // passthrough for testing

  if (command) {
    toPdf._wkpdf.command = command;
  }

  return toPdf;
};
