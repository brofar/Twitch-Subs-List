# Twitch Active Subs List
Displays a list of viewers in your stream, and a list of which of those viewers are subscribed to you.

I created this for a few streaming friends who do game giveaways on stream and offer 2x entries for subscribers who enter their draw. They can use this instead of having to manually check which entries in their draw are from subscribers and having to add the second entry manually.

### Feeling generous?
[![Buy me a Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/brofar)

## Features
* Lists viewers on your channel
* Lists all of your subscribers
* Lists all viewers who are also subscribers.

## Installation and setup

If you don't want to set this up for yourself, you can use my setup at https://twitch-subs-list.brofar.repl.co/

### Prerequisites

This is built with Node.js. Install the latest LTS version from [the official website](https://nodejs.org/en/download).

### Installation

To set up the script, clone it using `git`:

    git clone git@github.com:brofar/TwitchMonitor.git
    
Once installed, enter the directory and install the dependencies:

    cd Twitch-Subs-List
    npm install

### Configuration
 
To configure the bot, copy the included `.env.sample` to `.env` and enter or customize the values in the file. 

Configuration options explained:

|Key|Required?|Description|
|---|---------|-----------|
|`APP_CLIENT_ID`|☑|Client ID for your Twitch app, via developer portal (explained below).|
|`APP_OAUTH_SECRET`|☑|Client Secret for your Twitch app, via developer portal (explained below).|
|`APP_URL`|☑|The base URL of where your app is hosted with no trailing slash.|

### Getting required tokens

Note that you will need to set up a Twitch application: 

#### Twitch application
To connect to the Twitch API, you will need to register a new application in the [Twitch Developers Console](https://dev.twitch.tv/console/apps).

Set the redirect URL to `[whatever your application's url will be]/twitch/callback`

Grab the Client ID (`APP_CLIENT_ID` in .env).
Then, create a new secret and copy that into `APP_OAUTH_SECRET` in .env

### Starting the script

Once the application has been configured, start it using `node` from the installation directory:

    node .


## How to Use
1. Navigate to the server using your browser
1. Log in via Twitch if required (you'll automatically be redirected to Twitch if need be)
1. List is displayed

## Notes
* You will need to manually refresh the page to get up-to-date data. There's a giant refresh button at the top of the screen.

* The subscriber list includes yourself because technically you're an (infinite) tier 3 sub to your own channel.

* There's a big try-catch block in the code that is super bad practice. Don't be like me.