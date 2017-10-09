var readline = require("readline");
var assert = require("assert");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// rl.on('line', function (line) {
//     assert.deepEqual(line, "Throughput = 1556 bytes/sec");
// });

rl.on('line', function (line) {
    //assert.deepEqual(line, "Total lines = 1");
    assert.equal(line, "Growth rate = Infinity");

});
