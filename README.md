Hackable Slack Client
===============================

This app inserts CSS and JS files into Slack's normal web UI. This lets you
improve your experience quite a bit, or lets others help you improve your
experience. It's a standalone Mac app that's simple to install.

Installation
============

 * Download <https://dinosaur.s3.amazonaws.com/hackable-slack-client-0.1.4.zip> and
drag the Hackable Slack Client to your Applications folder. Sorry it's so big.
It's got a whole copy of Chrome.
 * Ask yourself which applies below: has **someone set this up** for your team,
 or are you the first for your team?

#### Someone on my team has set this up

 * Join `#slack-hacks`.
 * Use the client normally. You might need to refresh (cmd-r) if you joined
 after installing the client.

#### Nobody on my team is using this

 * Create `#slack-hacks`.
 * Add space-separated `.js` and `.css` asset URLs to the purpose (not topic!) of the `#slack-hacks` channel. Other text will be ignored. There are some examples below :point_down:.
 * Use the client normally. You might need to refresh (cmd-r) if you joined

#### Examples

If you'd like to use some sample asset changes, set your `#slack-hacks` purpose
(not topic) to be this:

```
https://obscure-fjord-9578.herokuapp.com/assets/application.js
https://obscure-fjord-9578.herokuapp.com/assets/application.css
```

The examples for these are at <https://github.com/bhuga/slacks-hacks>. PRs are
welcome!

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

Use `cmd-alt-i` to open the web inspector to see what CSS you can add.
Javascript is more challenging, but slack's javascript minification is not
particularly aggressive, and reverse engineering is possible. `TS` is the
object that everything else hangs off of, and anything ending in `sig` is
a trigger. The examples hook into slack's javascript and might be a good
starting point.
