
var template = {};

template.add = function (path, name, cb) {
    file.load(path, function (err, data) {
        if (err) return cb(err);
        template[name] = {
            path: path,
            html: data,
            compiled: Hogan.compile(data),
            render: function (params, partials) {
                return this.compiled.render(params, partials)
            }
        }
        return cb && cb();
    });
}

template.load = function (templates, cb) {
    (function loop (index) {
        if (index == templates.length) return cb && cb(null);
        var tm = templates[index];
        template.add(tm.path, tm.name, function (err) {
            if (err) return cb && cb(err);
            loop(++index);
        });
    }(0));
}
