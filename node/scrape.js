
var rb = require('./rubygems');


function owners (path, cb) {
    rb.scrape(path, function (err, res) {
        if (err) return cb(err);
        try {
            var owners = res.raw.match(/<h5>Owners<\/h5>[^<]*(<p>.*<\/p>)/)[1];
        } catch (e) {
            var error = new Error('No owners found');
        }
        cb(error, owners
            .replace(/(<a[^>]+)/g, '$1 target="_blank"')
            .replace(/href="([^"]+)"/g, 'href="http://rubygems.org$1"'));
    });
}

exports.owners = owners;
