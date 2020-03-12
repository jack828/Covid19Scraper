#!/bin/bash
source .env
rm -rf infect.png
nave use 10 node /var/application/infect/index.js
