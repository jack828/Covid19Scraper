#!/bin/bash
source .env
rm -rf infect.png
cd /var/application/infect/
git pull
nave use 10 node ./index.js
