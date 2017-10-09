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
    }  if (this.totals) {
        readBytes.bind(this)
    } else {
        this.push(null);
    }
};

function ThroughputStream(options) {
    if (!(this instanceof ThroughputStream)) {
        return new ThroughputStream(options);
    }
    Duplex.call(this, options);

    this.buffer = new Buffer('');
    this.timer = process.hrtime();
    this.throughput = 0;
    this.throughputArr = [];

}
util.inherits(ThroughputStream, Duplex);

var prevByteLength = 0;
var prevElapsedTime = 0;
ThroughputStream.prototype._write = function (chunk, enc, callback) {
    totals = JSON.parse(chunk.toString());

    bytes = totals.totalByteLength - prevByteLength;
    time = totals.elapsedTime - prevElapsedTime;

    var bytesPerSec = (bytes / time) * NS_PER_SEC;
    //console.log("Throughput = " + Math.round(bytesPerSec) + " bytes/sec");

    prevByteLength = totals.totalByteLength;
    prevElapsedTime = totals.elapsedTime;

    this.throughput = bytesPerSec;
    this.throughputArr.push(this.throughput.toString());
    callback();
};

ThroughputStream.prototype._read = function readBytes(size) {
    while (this.throughputArr.length) {
        var chunk = this.throughputArr.shift();
        if (!this.push(chunk)) {
            break;
        }
    }  if (this.throughput) {
        readBytes.bind(this)
    } else {
        this.push(null);
    }
};

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var totalsDuplex = new TotalsDuplex();
var throughputStream = new ThroughputStream();

var args = process.argv.slice(2);
var verbose = args.indexOf("--verbose") > -1;
var hasThroughput = args.indexOf("--throughput") > -1;
var hasTotalLines = args.indexOf("--total-lines") > -1;
var hasGrowthrate = args.indexOf("--growth-rate") > -1;

var pastTotalLines = 0;

output = function () {
    rl.on('line', function (line) {
        totalsDuplex.write(line);

        var totals = totalsDuplex.read().toString();

        if (verbose || hasThroughput) {
            throughputStream.write(totals);
            var throughput = Math.round(throughputStream.read().toString());
            console.log("Throughput = " + throughput + " bytes/sec");

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
};

output();
