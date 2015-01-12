
var http = require('http'),
    https = require('https');


/**
 * RubyGems constructor
 *
 * @param {Object} options
 * @api public
 */

function RubyGems (options) {
    var options = options || {};
    this.version = (options.version && options.version.toString()) || '1';
}

/**
 * Convert an object to a query string
 *
 * @param {Object} params
 * @api public
 */

RubyGems.prototype.toQueryString = function (params) {
    var result = [];
    for (var name in params) {
        result.push(name+'='+params[name]);
    }
    return result.join('&');
}

/**
 * Create url path
 *
 * @param {String} api
 * @param {Object} params
 * @api public
 */

RubyGems.prototype.getPath = function (api, params) {
    var params = params || {},
        path = ['/api', 'v'+this.version, api+'.json'].join('/');
    if (Object.keys(params).length) {
        path += '?'+this.toQueryString(params);
    }
    return path;
}

/**
 * Make a GET request
 *
 * @param {String} api
 * @param {Object} params
 * @param {Function} cb
 * @api public
 */

RubyGems.prototype.get = function (api, params, cb) {
    if (typeof params === 'function') {
        cb = params;
        params = {};
    }
    https.request({
        hostname: 'rubygems.org',
        port: 443,
        path: this.getPath(api, params),
        method: 'GET'
    }, function (res) {
        var buff = '';
        res.on('data', function (chunk) {
            buff += chunk;
        })
        .on('end', function () {
            res.raw = buff.toString();
            try {
                res.body = JSON.parse(res.raw);
            } catch (e) {
                var error = new Error(res.raw);
            }
            cb(error, res);
        });
    })
    .on('error', function (err) {
        cb(err);
    })
    .end();
}

/**
 * Make a POST request
 *
 * @param {String} api
 * @param {Object} params - url params
 * @param {Object} data - post params
 * @param {Function} cb
 * @api public
 */

RubyGems.prototype.post = function (api, params, data, cb) {
    var content = this.toQueryString(data);
    https.request({
        hostname: 'rubygems.org',
        port: 443,
        path: this.getPath(api, params),
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Content-Length': content.length,
        }
    }, function (res) {
        var buff = '';
        res.on('data', function (chunk) {
            buff += chunk;
        })
        .on('end', function () {
            res.raw = buff.toString();
            try {
                res.body = JSON.parse(res.raw);
            } catch (e) {
                var error = new Error(res.raw);
            }
            cb(error, res);
        });
    })
    .on('error', function (err) {
        cb(err);
    })
    .end(content);
}

/**
 * Make a GET request
 *
 * @param {String} api
 * @param {Object} params - url params
 * @param {Function} cb
 * @api public
 */

RubyGems.prototype.scrape = function (api, params, cb) {
    if (typeof params === 'function') {
        cb = params;
        params = {};
    }
    https.request({
        hostname: 'rubygems.org',
        port: 443,
        path: '/'+api,
        method: 'GET'
    }, function (res) {
        var buff = '';
        res.on('data', function (chunk) {
            buff += chunk;
        })
        .on('end', function () {
            res.raw = buff.toString();
            cb(null, res);
        });
    })
    .on('error', function (err) {
        cb(err);
    })
    .end();
}

module.exports = new RubyGems();
module.exports.RubyGems = RubyGems;
