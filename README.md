# What is this?

We're prototyping a mobile-first & offline-first version of Tweetdeck. The idea is to show/discover how close to native we can get with the web on evergreen browsers.

# Can I help?

Yes please! Check out the [overall plan & goals](https://docs.google.com/document/d/1vdUBZooLMBa5AtkED619kndf3eNz_LeltLZYQ71VEKQ/edit?usp=sharing), then find yourself a ticket to complete (or feel free to disagree with the current direction/structure/whatever).

If you're taking a ticket on, make sure you announce it in the comments so others know you're doing it.

## Getting set up

Install [Node](http://nodejs.org/) then clone this repo & run:

```sh
npm install
npm start
```

You should be able to access the site at [localhost:3000](http://localhost:3000). API requests to TweetDeck are handled via proxy which runs on [localhost:8001](http://localhost:8001).
