# streams

Installing:

`npm install`

Usage:

`tail logfile.txt | node streamer.js --verbose`

Usage where each argument is optional

`tail logfile.txt | node streamer.js --growth-rate --throughput --total-lines`

Testing (tests pass if there are no assertion errors):

`chmod +x test.sh`

`./test.sh`