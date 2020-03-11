#!/bin/bash
rm -rf infect.png
nave use 10 node /var/application/infect/index.js
curl https://slack.com/api/files.upload \
  -F token="$SLACK_TOKEN" \
  -F channels="$SLACK_CHANNEL" \
  -F title="Today's Infected" \
  -F filename="infect.png" \
  -F file=@"./infect.png"
