var readline = require("readline");
var assert = require("assert");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    assert.equal(line, "Growth rate = Infinity");
});
