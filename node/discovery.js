
var async = require('async');
var rb = require('./rubygems');


function run (root, step, done) {
    if (done === undefined) {
        done = step;
        step = null;
    }

    var gems = {},
        wait = {},
        error = false;

    function getGem (gem, done) {
        if (error) return done(error);

        if (!gems.hasOwnProperty(gem.name) && !wait.hasOwnProperty(gem.name)) {
            wait[gem.name] = true;
            rb.get('gems/'+gem.name, function (err, res) {
                if (err) return done(err);

                delete wait[gem.name];
                gems[gem.name] = res.body;

                // console.log('gem', '->', gem.name);
                if (step) error = step(res.body);
                if (error) return done(error);

                if (res.body.dependencies.runtime.length)
                    deps(res.body.dependencies.runtime, done);
                else done();
            });
        }
        else {
            // console.log('pass');
            done(error);
        }
    }

    function deps (dependencies, done) {
        async.each(
            dependencies,
            getGem,
            function (err) {
                if (err) return done(err);
                // console.log('DONE!');
                done();
            }
        );
    }

    getGem({name: root}, function (err) {
        if (err) return done(err);
        // console.log('FINISH!');
        done(null, gems);
    });
}

exports.run = run;
