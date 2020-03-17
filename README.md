# Covid19Scraper
Scrapes websites to post data about Covid-19 to Slack channels.

## Config

You'll need to setup a Slack App.
It will need the Interactive Components enabled, with these endpoints:
 - Request - `<URL>/api/slack/request`
 - Select Menus - `<URL>/api/slack/select`

For OAuth scopes, you need to enable:
 - chat:write
 - files:read
 - files:upload

| ENV | Usage |
|-----|-------|
| SLACK_TOKEN | Legacy, not used now |
| SLACK_BOT_TOKEN | Your slack bot token |
| SLACK_CHANNEL | The channel to post to |
| PORT | Port the webserver runs on |
| ISLAND_HANGOUT_URL | An always open webchat link |

## Cron Jobs

These are the crons that need to be enabled:

### Data scraper

Entrypoint: `./datascraper.js`
Loads and scrapes information from WHO and UK Gov dashboards. Stores in `{global,uk}-cases.json`, for responding to interactive messages.
Best to run shortly after 9AM updates.

```
# /etc/crontab: system-wide crontab
# m h dom mon dow user	command
15 9    * * *   USER cd /var/application/infect && /bin/zsh ./scrape.sh >> /home/user/covid-run.log 2>&1
```

### Data poster

Entrypoint: `./index.js`
Screenshots WHO and UK Gov dashboards, after removing the map elements.
Will post to specified channel, with source links as replies.
Posts an interactive message to allow users to filter results by Country and County.
Best to run shortly after 9AM updates.

```
# /etc/crontab: system-wide crontab
# m h dom mon dow user	command
10 9    * * *   USER cd /var/application/infect && /bin/zsh ./scrape.sh >> /home/user/covid-scrape.log 2>&1
```

## Interactive Server

A server is provided at `./server.js` to allow responding to interactive elements.
I use [pm2](https://www.npmjs.com/package/pm2) to manage this server.
