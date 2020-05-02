var BigInteger = require('bigi');

function big(value) {
    return new BigInteger(value.toString());
}

var THOUSAND = big(1e3);
var MILLION = big(1e6);

var nanotime = function() {
    if (!exports.start) {
        exports.start = process.hrtime();
        exports.startMilli = big(new Date().getTime());
    }

    var hrtime = process.hrtime(exports.start);

    return big(hrtime[0])
        .multiply(THOUSAND)
        .add(exports.startMilli)
        .multiply(MILLION)
        .add(big(hrtime[1]))
        .toString();
};

module.exports = exports = function() {
    return exports.get();
}

exports.get = nanotime;
