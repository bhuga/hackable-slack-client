Hackable Slack Client
===============================

This app helps you insert CSS and JS files into Slack. This lets you
improve your experience quite a bit, or lets others help you improve your
experience. It's a standalone Mac app that's simple to install.

Installation
============

Download <foo> and drag the Hackable Slack Client to your Applications folder.

If you're the first person on your slack team to set up the client, you'll need
to add some user assets. These are stored in your team as the `purpose` (not
topic) of the room `#slack-hacks`, which you must join to use the Hackable Slack
Client. Any `.js` or `.css` URLs will be parsed out of the purpose and injected
into your Slack session. You can use the examples, below, to see some big
changes.

After installation, just run the program and log in to Slack normally. **You may
need to change channels a couple of times to get things to load.**

Examples
========

If you'd like to use some sample asset changes, set your `#slack-hacks` purpose
(not topic) to be this:

```
https://obscure-fjord-9578.herokuapp.com/assets/application.js
https://obscure-fjord-9578.herokuapp.com/assets/application.css
```

Development
============

###### How it works

This repository contains no code to update Slack; it only contains code to
help you load code.

Upon loading, a remote JS file will be injected into the page. This file is
static. This file finds the `#slack-hacks` channel, finds its `purpose`, and
parses asset URLs from it. These are then injected to the page. CSS rules will
be immediately applied.

CSP is disabled on Slack to make this work. This is a huge problem and you
should never use the Hackable Slack Client.

###### Hacking

The Hackable Slack Client uses
[electron-boilerplate](https://github.com/szwacz/electron-boilerplate). The docs
there apply for contributions to the main application.

If you'd like to do local development for assets, just add their URLs to the
purpose of the `#slack-hacks` room. If you have joined a `#slack-hacks-dev`
room, those assets will be used instead. Assets must come from HTTPs hosts.
