# Twitch Subs List
This is a service that uses the Twitch API to display a list of viewers in your stream, and a list of which of those viewers are subscribed to you.

I created this for a few streaming friends who do game giveaways on stream and offer 2x entries for subscribers who enter their draw. They can use this instead of having to manually check which entries in their draw are from subscribers and having to add the second entry manually.

## Installation
Uses NodeJS. My implementation is on repl.it, which automatically downloads all the needed libraries.

1. Upload to whatever you host on
1. Run

## Libraries
* express
* body-parser
* node-rest-client
* cookie-parser
* express-handlebars

## How to Use
1. Navigate to the server using your browser
1. Log in via Twitch if required (you'll automatically be redirected to Twitch if need be)
1. List is displayed

## Notes
* You will need to manually refresh the page to get up-to-date data. There's a giant refresh button at the top of the screen.

* The subscriber list includes yourself because technically you're an (infinite) sub to your own stream.

* There's a big try-catch block in the code that is super bad practice. Don't be like me.

## Live Implementation
https://twitch-subs-list.brofar.repl.co/