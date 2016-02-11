(function() {
  function setupWebview(team_name) {
    var webview = document.createElement('webview');
    webview.setAttribute("preload", "expose-window-apis.js");
    webview.setAttribute("src", "https://my.slack.com/ssb");
    webview.addEventListener('did-finish-load', function(event) {
      this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','localhax://slack-hacks-loader.js'); document.head.appendChild(s);");
    });
    webview.addEventListener('console-message', function(e) {
      console.log(team_name + ": " + e.message);
    });
    return webview;
  }
  console.log("hello from teams_container.js");

  var loadedTeams = [];

  try {
    var teams_data;
    teams_data = JSON.parse(localStorage.getItem("logged_in_teams"));
    if (teams_data != null) {
      loadedTeams = teams_data;
    }
  } catch (e) {}

  if (loadedTeams.length >= 2) {
    document.getElementById("teams").classList.add("multiple");
  } else {
    document.getElementById("teams").classList.add("single");
  }

  if (loadedTeams.length == 0) {
    var webview = setupWebview("my");
    var active_team = document.getElementById("active_team");
    active_team.appendChild(webview);
  }
}).call()
