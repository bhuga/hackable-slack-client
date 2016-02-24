(function() {
  window.teamWebviews = {}

  window.setupWebview = function(team_name) {
    console.log("setting up web view for " + team_name);
    var webview = document.createElement('webview');
    webview.setAttribute("preload", "expose-window-apis.js");
    webview.setAttribute("src", "https://" + team_name + ".slack.com/ssb");
    webview.addEventListener('did-finish-load', function(event) {
      this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','localhax://slack-hacks-loader.js'); document.head.appendChild(s);");
      var match = this.getURL().match(/https:\/\/([^\.]+)\.slack\.com\/messages/)
      if (match != null) {
        this.executeJavaScript("reportLogin()");
      }
    });
    webview.addEventListener('console-message', function(e) {
      //console.log(team_name + ": " + e.message);
    });
    webview.addEventListener('ipc-message', function(event, arg) {
      if (event.channel == "login") {
        addLoggedInTeam(event.args[0])
      }
    });
    var wrapper = document.createElement("div")
    wrapper.appendChild(webview)
    wrapper.style.position = "absolute"
    wrapper.style.left = "-50000px"
    document.getElementById("active_team").appendChild(wrapper) // force preload
    //wrapper.style.display = "none"
    //wrapper.style.height = undefined
    return wrapper;
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

  window.addLoggedInTeam = function(team) {
    console.log("adding logged in team");
    var teams = loadTeamsFromStorage()
    var existing_team = teams.find(function(existing_team) { return existing_team.team_name == team.team_name })
    console.log("found a logged in team maybe:")
    console.log(existing_team);
    if (typeof existing_team == "undefined") {
      teams.push(team)
      localStorage.setItem("logged_in_teams", JSON.stringify(teams))
      window.loadTeams()
    } else {
      if (typeof team.icon_url != "undefined") {
        existing_team.icon_url = team.icon_url
        document.getElementById(existing_team.team_name + "_icon").style.backgroundImage = "url(" + team.icon_url + ")"
      }
    }
  }

  window.activateWebview = function(team_name) {
    console.log("activating team:" + team_name);
    var active_team = document.getElementById("active_team");
    if (active_team.team_name == team_name) {
      console.log("not re-activating " + team_name)
      return
    }

    var previous = active_team.querySelector('.current')
    if (typeof previous != "undefined" && previous != null) {
      previous.classList.remove("current")
      previous.style.position = "absolute"
      previous.style.left = "-50000px"
    }

    var next = window.teamWebviews[team_name]

    console.log(next)
    next.style.removeProperty("position")
    next.style.removeProperty("left")

    next.style.marginTop = "1px"
    next.style.marginLeft = "1px"
    next.classList.add("current")
    setTimeout(function() { next.style.marginTop = "0px" ; next.style.marginLeft = "0px"; }, 1)

    active_team.team_name = team_name
  }

  window.loadTeams = function() {
    loadedTeams = loadTeamsFromStorage()
    var teams_div = document.getElementById("teams")
    if (loadedTeams.length >= 2) {
      teams_div.classList.add("multiple");
      teams_div.classList.remove("single");
    } else {
      teams_div.classList.add("single");
      teams_div.classList.remove("multiple");
    }

    var active_team = document.getElementById("active_team");
    if (loadedTeams.length == 0) {
      console.log("loading up 'my'; no teams found")
      var webview = setupWebview("my");
      active_team.appendChild(webview);
    } else {
      for (team of loadedTeams) {
        if (window.teamWebviews[team.team_name] == null || typeof window.teamWebviews[team.team_name] == "undefined") {
          console.log("setting up web view:")
          console.log(team)
          window.teamWebviews[team.team_name] = setupWebview(team.team_name)
          var icon_div = document.createElement("div")
          icon_div.classList.add("team_icon")
          icon_div.id = team.team_name + "_icon"
          icon_div.style.backgroundImage = "url(" + team.icon_url + ")"
          icon_div.team_name = team.team_name
          teams_div.appendChild(icon_div)
        }
      }
      if (typeof active_team.team_name == "undefined") {
        activateWebview(loadedTeams[0].team_name)
      }

    }
  };

  console.log("hello from teams_container.js");
  window.loadTeams();

  iconClickListener = function(event) {
    console.log(event);
    if (!event.target.classList.contains("team_icon")) {
      return
    }

    activateWebview(event.target.team_name)

    event.preventDefault();
  }
  document.addEventListener("click", iconClickListener, true);
}).call()
