#!/bin/zsh
source .env
rm -rf uk-cases.png world-cases.png
git pull
yarn
node -v
node ./index.js
