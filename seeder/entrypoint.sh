#!/bin/sh

./waitForAlive.js -d 5000 -c http://localstack:4576 -c http://localstack:4593 -c http://localstack:4572

terraform init
terraform apply -auto-approve