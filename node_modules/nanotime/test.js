var expect = require('expect.js');
var nanotime = require('.');

describe('nanotime', function() {
    it('should be around millisecs * 1e6', function() {
        var nanos = nanotime();
        var millis = new Date().getTime();
        var delta = Math.abs(millis - nanos / 1e6);
        expect(delta).to.be.below(100);
    });

    it('should always increase after sleeps', function(done) {
        this.timeout(10000);

        var iteration = 0;
        var iterations = 50;
        var last;

        function next() {
            var value = nanotime();

            if (last != null) {
                expect(value).to.be.above(last);
            }

            last = value;

            if (++iteration >= iterations) {
                return done();
            }

            setTimeout(next, Math.floor(Math.random() * 100));
        }

        next();
    });

    it('should always increase without sleeps', function() {
        var last;

        for (var i = 0; i < 1000; i++) {
            var value = nanotime();

            if (last != null) {
                expect(value).to.be.above(last);
            }

            // console.log(last, value);

            last = value;
        }
    });
});
