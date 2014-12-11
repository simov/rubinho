
var cheerio = require('cheerio');
var rb = require('./rubygems');


function owners (path, cb) {
    rb.scrape(path, function (err, res) {
        if (err) return cb(err);
        var $ = cheerio.load(res.raw);

        $('.gem__owners a').each(function (index) {
            $(this).attr('target', '_blank');
            var path = $(this).attr('href');
            $(this).attr('href', 'http://rubygems.org'+path);
        });

        cb(null, $('<div>').append($('.gem__owners')).html());
    });
}

exports.owners = owners;
