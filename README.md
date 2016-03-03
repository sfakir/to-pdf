# srv-to-pdf [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Microservice to convert HTML with embedded or served css to pdf using webkitToPDF

This accepts html files with embedded CSS and returns PDF documents utilizing the `wkhtmltopdf` command line tool.  

## Installation

There are two ways to install: as a module or a microserver.

#### 1. As submodule
```bash
npm install --save srv-to-pdf
```

#### 2. As microservice
```bash
git clone http://github.com/uci-soe/to-pdf
cd to-pdf
npm start
```

### Dependancies

This module requires a locally installed version of `wkhtmltopdf`. I presently have

```
$ wkhtmltopdf --version
Name:
  wkhtmltopdf 0.10.0 rc2

License:
  Copyright (C) 2010 wkhtmltopdf/wkhtmltoimage Authors.
```


#### Running Microservice with PM2

PM2 is recommended. Here is an example `pm2.json` 

```json
{
  "name"        : "srv-to-pdf",
  "script"      : "bin/www.js",
  "args"        : [],
  "watch"       : true,
  "node_args"   : "",
  "cwd"         : "/root/path/to/srv-to-pdf",
  "env": {
    "NODE_ENV": "production",
    "PORT": "6000",
    "NODE_DEBUG": "",
    "CMD_PATH": "/path/to/bin/wkhtmltopdf"
  }
}
```

More `pm2.json` documentation available [here](http://pm2.keymetrics.io/docs/usage/application-declaration/)

## Usage

```javascript
/* Add usage for submodule */
```

```javascript
/* Add usage for microservice */
```


## License

BSD-3-Clause - [LICENSE](LICENSE)


[npm-image]: https://badge.fury.io/js/srv-to-pdf.svg
[npm-url]: https://npmjs.org/package/srv-to-pdf
[travis-image]: https://travis-ci.org/uci-soe/srv-to-pdf.svg?branch=master
[travis-url]: https://travis-ci.org/uci-soe/srv-to-pdf
[daviddm-image]: https://david-dm.org/uci-soe/srv-to-pdf.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/uci-soe/srv-to-pdf
[coveralls-image]: https://coveralls.io/repos/uci-soe/srv-to-pdf/badge.svg
[coveralls-url]: https://coveralls.io/r/uci-soe/srv-to-pdf
