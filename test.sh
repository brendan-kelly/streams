echo 'log entry 1' | node streamer.js --total-lines | node tests/testTotalLines.js
echo 'log entry 2' | node streamer.js --growth-rate | node tests/testGrowthRate.js
