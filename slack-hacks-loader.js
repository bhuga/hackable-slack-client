(function() {
  console.log("Slack hacks loader loading...");
  url_regex = new RegExp("^" + "(?:(?:https?|)://)" + "(?:\\S+(?::\\S*)?@)?" + "(?:" + "(?!(?:10|127)(?:\\.\\d{1,3}){3})" + "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" + "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" + "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" + "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" + "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" + "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" + "\\.?" + ")" + "(?::\\d{2,5})?" + "(?:[/?#]\\S*)?" + "$", "i");

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
    var channel_purpose, i, j, len, len1, results, url, urls, word, words;
    channel = TS.channels.getChannelByName("#slack-hacks-dev");
    channel_purpose = channel.purpose.value;
    console.log(channel_purpose);

    if (channel_purpose === null || typeof channel_purpose === 'undefined') {
      channel = TS.channels.getChannelByName("#slack-hacks");
      channel_purpose = channel.purpose.value;
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
  };

  TS.channels.switched_sig.addOnce(slackHacksLoader);

}).call(this);
