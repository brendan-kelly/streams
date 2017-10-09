# streams

Usage:

`tail logfile.txt | node stream.js --verbose`

`tail logfile.txt | node stream.js --growth-rate --throughput --total-lines`

Testing (tests pass if there is no assertion error):

`echo 'log entry 1' | node streamer.js  --total-lines | node tests/testTotalLines.js`

`echo 'log entry 2' | node streamer.js  --growth-rate | node tests/testGrowthRate.js`