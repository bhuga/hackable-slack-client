(function() {
  window.teamWebviews = {}

  function setupWebview(team_name) {
    var webview = document.createElement('webview');
    webview.setAttribute("preload", "expose-window-apis.js");
    webview.setAttribute("src", "https://my.slack.com/ssb");
    webview.addEventListener('did-finish-load', function(event) {
      this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','localhax://slack-hacks-loader.js'); document.head.appendChild(s);");
      var match = this.getURL().match(/https:\/\/([^\.]+)\.slack\.com\/messages/)
      if (match != null) {
        window.addLoggedInTeam(match[1]);
      }
    });
    webview.addEventListener('console-message', function(e) {
      console.log(team_name + ": " + e.message);
    });
    return webview;
  }

  window.loadTeamsFromStorage = function() {
    var loadedTeams = [];

    try {
      var teams_data;
      teams_data = JSON.parse(localStorage.getItem("logged_in_teams"));
      if (teams_data != null) {
        loadedTeams = teams_data;
      }
    } catch (e) {
      console.log("Failed to load teams from local storage:");
      console.log(e);
    }
    return loadedTeams;
  }

  window.addLoggedInTeam = function(team_name) {
    var teams = loadTeamsFromStorage()
    if (teams.indexOf(team_name) == -1 && team_name != "my") {
      teams.push(team_name)
      localStorage.setItem("logged_in_teams", JSON.stringify(teams));
      window.loadTeams();
    }
  }

  window.loadTeams = function() {
    loadedTeams = loadTeamsFromStorage()
    if (loadedTeams.length >= 2) {
      document.getElementById("teams").classList.add("multiple");
    } else {
      document.getElementById("teams").classList.add("single");
    }

    if (loadedTeams.length == 0) {
      var webview = setupWebview("my");
      var active_team = document.getElementById("active_team");
      active_team.appendChild(webview);
    } else {
      for (team of loadedTeams) {
        if (window.teamWebviews[team] == null || typeof window.teamWebviews[team] == "undefined") {
          window.teamWebviews[team] = setupWebview(team)
        }
      }
      if (active_team.innerHTML == null) {
        active_team.appendChild(window.teamWebviews[loadedTeams[0]])
      }
    }
  };

  console.log("hello from teams_container.js");
  window.loadTeams();
}).call()
