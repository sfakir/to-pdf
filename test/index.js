'use strict';

var assert   = require('assert');
var toPdfFac = require('../lib');

var isPdf     = require('is-pdf');
var isStream  = require('is-stream');
var isPromise = require('q').isPromise;

describe('toPdf', function () {
  var testString = '<html><body><h1>hello, world</h1></body></html>';
  var slowTime   = 2 * 1000 * 3; // 2 seconds is normal, slow needs x3 times for "Normal"
  var toPdf;

  describe('eventual returns', function () {
    before(function () {
      toPdf = toPdfFac();
    });

    it('should produce a pdf buffer/file', function (done) {
      this.slow(slowTime); // eslint-disable-line no-invalid-this
      var out = toPdf(testString);

      out.then(function (pdf) {
        assert(isPdf(pdf), 'not a pdf');
        done();
      });
    });
  });

  describe('immediate returns', function () {
    before(function () {
      toPdf = toPdfFac();
    });

    it('should produce produce a promise', function () {
      var out = toPdf(testString);

      assert(isPromise(out), 'output should be a promise');
      assert(!isStream(out), 'output should not be a stream');
    });
    it('should accept a callback', function (done) {
      this.slow(slowTime); // eslint-disable-line no-invalid-this

      var out = toPdf(testString, function () {
        assert(true, 'callback should be called');
        done();
      });

      assert(!isPromise(out), 'output should not be a promise');
      assert(!isStream(out), 'output should not be a stream');
    });
    it('should have a stream-mode', function () {
      var out = toPdf.stream(testString);

      assert(!isPromise(out), 'output should not be a promise');
      assert(isStream(out), 'output should be a stream');
    });
  });

  describe('errors', function () {
    before(function () {
      toPdf = toPdfFac();
    });

    it('should produce error with no string', function () {
      assert.throws(function () {
        toPdf();
      }, /no.+(string|str)/i);
    });
  });

  describe('Options', function () {
    var newLoc = '/new/route';
    before(function () {
      toPdf = toPdfFac({
        command: newLoc
      });
    });

    it('should allow for alternative wkhtmltopdf bin location', function () {
      assert.equal(toPdf._wkpdf.command, newLoc);
      assert(!toPdf.defaults.command, 'Command option should be removed before it hits the defaults');
    });

    it('should allow for landscape option to change orientation', function (done) {
      toPdf._wkpdf = function (_, options) {
        assert.equal(options.orientation, 'Landscape');
        done();
      };

      toPdf.stream(testString, {landscape: true});
    });


  });
});
