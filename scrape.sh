#!/bin/bash
source .env
rm -rf global-cases.json
rm -rf uk-cases.json
nave use 10 node /var/application/infect/datascraper.js
