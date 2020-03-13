#!/bin/zsh
source .env
rm -rf uk-cases.png world-cases.png
git pull
nave use 10 node ./index.js
