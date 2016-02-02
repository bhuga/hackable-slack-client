(function() {
  console.log("Slack hacks loader loading...");
  url_regex = new RegExp("^" + "(?:(?:https?|haxs?)://)" + "(?:\\S+(?::\\S*)?@)?" + "(?:" + "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" + "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" + "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))?" + "\\.?" + ")" + "(?::\\d{2,5})?" + "(?:[/?#]\\S*)?" + "$", "i");
  TS.model.mac_ssb_version = 1.1
  TS.model.mac_ssb_version_minor = 4

  window.loadUrl = insertUrl = function(url) {
    var css, s;
    console.log(url);
    if (url.match(/\.css$/)) {
      css = document.createElement('link');
      css.setAttribute('href', url);
      css.setAttribute('type', 'text/css');
      css.setAttribute('rel', 'stylesheet');
      return document.head.appendChild(css);
    } else if (url.match(/\.js$/)) {
      s = document.createElement('script');
      s.setAttribute('src', url);
      return document.head.appendChild(s);
    }
  };

  slackHacksLoader = function() {
    if (window.slackHacksLoaded === true) {
      return
    }
    var channel_purpose, i, j, len, len1, results, url, urls, word, words;
    channel = TS.channels.getChannelByName("#slack-hacks-dev");
    if (channel != null && typeof channel != 'undefined') {
      channel_purpose = channel.purpose.value;
    }

    if (channel_purpose === null || typeof channel_purpose === 'undefined') {
      channel = TS.channels.getChannelByName("#slack-hacks");
      if (channel != null && typeof channel != 'undefined') {
        channel_purpose = channel.purpose.value;
      }
    }

    console.log(channel_purpose);
    if (channel_purpose != null && typeof channel_purpose != 'undefined') {
      window.slackHacksLoaded = true
    } else {
      return
    }

    TS.members.ensureMemberIsPresent({ user: channel.purpose.creator}).then(function(arg1, arg2, arg3) {
      creator = TS.members.getMemberById(channel.purpose.creator);
      console.log("Channel purpose was created by " + creator.name);
      if (!creator.is_owner) {
        console.log("Refusing to inject hacks from channel purpose created by non-admin " + creator.name + ": " + channel_purpose);
        return;
      }

      words = channel_purpose.split(/\s+/);
      urls = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        if (word.match(url_regex)) {
          urls.push(word);
        }
      }
      console.log(words);
      console.log(urls);
      results = [];
      for (j = 0, len1 = urls.length; j < len1; j++) {
        url = urls[j];
        results.push(insertUrl(url));
      }
      return results;
    });
  };

  slackHacksLoader()
  if (window.slackHacksLoaded != true) {
    TS.channels.data_updated_sig.addOnce(slackHacksLoader);
    TS.client.login_sig.addOnce(slackHacksLoader);
  }

}).call(this);
