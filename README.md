Hackable Slack Client
===============================

This app inserts CSS and JS files into Slack's normal web UI. This lets you
improve your experience quite a bit, or lets others help you improve your
experience. It's a standalone Mac app that's simple to install.

Installation
============

First, download <https://dinosaur.s3.amazonaws.com/hackable-slack-client-0.3.2.zip> and
drag the Hackable Slack Client to your Applications folder. Sorry it's so big.
It's got a whole copy of Chrome.

Next, decide how you want to inject hacks into the client.

#### Someone on my team set this up, and I want to use it.

 * Join `#slack-hacks`.
 * Use the client normally. You might need to refresh (cmd-r) if you joined
 #slack-hacks after installing the client.

#### I want to set this up so my whole team can use some hacks

 * Create `#slack-hacks`.
 * Add space-separated `.js` and `.css` asset URLs to the purpose (not topic!) of the `#slack-hacks` channel. Other text will be ignored. In order to be compatible with Slack's CSP, we use a unique URL scheme. Instead of `http` and `https`, use `hax` and `haxs`, respectively. To provide a modicum of security, a team owner must edit the channel purpose that injects the links. There are some examples below :point_down:.
 * Use the client normally. You might need to refresh (cmd-r) if you joined

#### I just want to use this myself, or I want to overwrite some team-wide hacks
 * Add `hax://` or `haxs://` URLs to the `title` field of your profile at
 `https://my.slack.com/account/profile`. Reload the client after adding URLs.

#### Example Hacks

If you'd like to use some sample asset changes, set your `#slack-hacks` purpose
(not topic) to be this:

```
haxs://slacks-hacks.herokuapp.com/assets/application.js
haxs://slacks-hacks.herokuapp.com/assets/application.css
```

**Note the URL scheme of `haxs` instead of `https`!** `http`
and `https` URLs will fail to load in order to maintain compliance with CSP.

The examples for these are at <https://github.com/bhuga/slacks-hacks>. PRs are
welcome!

Development
============

###### How it works

This repository contains no code to update Slack; it only contains code to
help you load code.

Upon loading, a javascript file will be injected into the page. This file is
static. This file finds the `#slack-hacks` channel, finds its `purpose`, and
parses asset URL from it. These are then injected to the page. After these have
been injected, asset URLs from the `title` field of your profile will be loaded.


###### Hacking

The Hackable Slack Client uses
[electron-boilerplate](https://github.com/szwacz/electron-boilerplate). The docs
there apply for contributions to the main application.

If you'd like to do local development for assets, just add their URLs to the
purpose of the `#slack-hacks` room. If you have joined a `#slack-hacks-dev`
room, those assets will be used instead.

Use `cmd-alt-i` to open the web inspector to see what CSS you can add.
Javascript is more challenging, but slack's javascript minification is not
particularly aggressive, and reverse engineering is possible. `TS` is the
object that everything else hangs off of, and anything ending in `sig` is
a trigger. The examples hook into slack's javascript and might be a good
starting point.
