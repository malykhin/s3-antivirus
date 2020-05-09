#!/bin/sh

/tmp/waitForAlive.js -d 5000 -c http://localstack:4576 -c http://localstack:4593 -o http://localstack:4572/import-bucket

freshclam -d
clamd start

npm run start