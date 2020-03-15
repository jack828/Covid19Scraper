#!/bin/zsh
source .env
rm -rf uk-cases.json global-cases.json
git pull
yarn
node -v
node ./datascraper.js
