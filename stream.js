var stream = require('stream');
var util = require('util');
var Duplex = stream.Duplex || require('readable-stream').Duplex;
var readline = require('readline');

const NS_PER_SEC = 1e9;

function TotalsDuplex(options) {
    if (!(this instanceof TotalsDuplex)) {
        return new TotalsDuplex(options);
    }
    Duplex.call(this, options);

    this.buffer = new Buffer('');
    this.timer = process.hrtime();
    this.totals = {};
    this.totalsArr = [];

}
util.inherits(TotalsDuplex, Duplex);

var totalByteLength = 0;
var totalLines = 0;
TotalsDuplex.prototype._write = function (chunk, enc, callback) {
    this.buffer = new Buffer(chunk);

    totalLines += this.buffer.toString().split('\n').length;

    totalByteLength += this.buffer.byteLength;

    var time = process.hrtime(this.timer);
    var elaspedTime = time[0] * NS_PER_SEC + time[1];

    var totals = {
        elapsedTime: elaspedTime,
        totalByteLength: totalByteLength,
        totalLines: totalLines
    };

    this.totals = totals;
    this.totalsArr.push(JSON.stringify(this.totals));
    callback();
};

TotalsDuplex.prototype._read = function readBytes(size) {
    while (this.totalsArr.length) {
        var chunk = this.totalsArr.shift();
        if (!this.push(chunk)) {
            break;
        }
    }  if (this.timer) {
        readBytes.bind(this)
    } else { // we are done, push null to end stream
        this.push(null);
    }
};

function OutputStream(options) {
    if (!(this instanceof OutputStream)) {
        return new OutputStream(options);
    }
    Duplex.call(this, options);

    this.buffer = new Buffer('');
    this.timer = process.hrtime();
    this.totals = {};
    this.totalsArr = [];

}
util.inherits(OutputStream, Duplex);

var prevByteLength = 0;
var prevElapsedTime = 0;
OutputStream.prototype._write = function (chunk, enc, callback) {
    totals = JSON.parse(chunk.toString());

    a = totals.totalByteLength - prevByteLength;
    b = totals.elapsedTime - prevElapsedTime;

    var bytesPerSec = (a / b) * NS_PER_SEC;
    console.log("Throughput = " + Math.round(bytesPerSec) + " bytes/sec");

    prevByteLength = totals.totalByteLength;
    prevElapsedTime = totals.elapsedTime;

    callback();
};


var totalsDuplex = new TotalsDuplex();
var outputStream = new OutputStream();

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var args = process.argv.slice(2);
var verbose = args.indexOf("--verbose") > -1;
var hasThroughput = args.indexOf("--throughput") > -1;
var hasTotalLines = args.indexOf("--total-lines") > -1;
var hasGrowthrate = args.indexOf("--growth-rate") > -1;

var growthRate = 1;
var pastTotalLines = 0;

rl.on('line', function(line) {
    totalsDuplex.write(line);

    var totals = totalsDuplex.read().toString();

    if (verbose || hasThroughput) {
        outputStream.write(totals);
    }

    totalsObj = JSON.parse(totals);

    if (verbose || hasTotalLines) {
        console.log("Total lines = " + totalsObj.totalLines);
    }

    if (verbose || hasGrowthrate) {
        var growthRate = (totalsObj.totalLines - pastTotalLines) / pastTotalLines;
        console.log("Growth rate = " + Math.round(growthRate * 10000) / 10000);
        pastTotalLines = totalsObj.totalLines;
    }
});
