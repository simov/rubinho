
var file = {};

file.load = function (path, cb) {
    var xhr = new XMLHttpRequest(),
        params = '?preventCache='+new Date();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            cb(null, xhr.responseText);
        }
    };
    xhr.open('GET', path+params, true);
    try {
        xhr.send();
    } catch (e) {
        return cb(new Error('Couldn\'t load file'));
    }
}

file.loadList = function (paths, cb) {
    var result = {};
    (function loop (index) {
        if (index == paths.length) return cb(null, result);
        file.load(paths[index], function (err, text) {
            if (err) return cb(err);
            result[paths[index]] = text;
            loop(++index);
        });
    }(0));
}
