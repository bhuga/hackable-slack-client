(function() {
  window.teamWebviews = {}

  window.setupWebview = function(team_name) {
    console.log("setting up web view for " + team_name);
    var webview = document.createElement('webview');
    webview.setAttribute("preload", "expose-window-apis.js");
    webview.setAttribute("src", "https://" + team_name + ".slack.com/ssb");
    webview.classList.add("team_web_view")
    parentWindow = window;
    webview.addEventListener('did-finish-load', function(event) {
      if (this.getURL().match(/signout\/done$/)) {
        parentWindow.console.log("Logging out of " + team_name)
        parentWindow.removeLoggedInTeam(team_name)
        return
      }
      this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','localhax://slack-hacks-loader.js'); document.head.appendChild(s);");
      var match = this.getURL().match(/https:\/\/([^\.]+)\.slack\.com\/messages/)
      if (match != null) {
        this.executeJavaScript("reportLogin()");
      }
    });
    webview.addEventListener('console-message', function(e) {
      //console.log(team_name + ": " + e.message);
    });
    webview.addEventListener('ipc-message', function(event) {
      if (event.channel == "login") {
        addLoggedInTeam(event.args[0])
      } else if (event.channel == "team-badge") {
        setTeamBadge(event.args[0].team_name, event.args[0].badge_text)
        //console.log(event)
      } else if (event.channel == "team-bounce") {
        //console.log(event)
        //console.log(arg)
      }
    });
    var wrapper = document.createElement("div")
    wrapper.appendChild(webview)
    if (team_name === "my") {
      // special case: the active webview is a login screen. this should only ever happen once, when we have no teams.
      wrapper.style.marginTop = "1px"
      wrapper.style.marginLeft = "1px"
      wrapper.classList.add("current")
      setTimeout(function() { wrapper.style.marginTop = "0px" ; wrapper.style.marginLeft = "0px"; }, 1)
    } else {
      wrapper.style.position = "absolute"
      wrapper.style.left = "-50000px"
    }
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

  window.setTeamBadge = function(team_name, text) {
    var match = text.match(/^\d+$/)
    var badge = document.getElementById(team_name + "_badge")
    if (match != null) {
      badge.innerHTML = text
      badge.style.display = "block"
    } else {
      badge.innerHTML = ""
      badge.style.display = "none"
    }

    var allBadges = document.getElementsByClassName('badge')
    var total = 0
    if (allBadges.length > 0) {
      for (var i = 0; i < allBadges.length; i++) {
        badge = allBadges[i]
        text = badge.innerHTML
        if (text.match(/^\d+$/) != null) {
          total = parseInt(text) + total
        }
      }
      if (total == 0) {
        ipc.send("badge", { badge_text: ""})
      } else {
        ipc.send("badge", { badge_text: total})
      }
    }
  }

  window.addLoggedInTeam = function(team) {
    var teams = loadTeamsFromStorage()
    var existing_team = teams.find(function(existing_team) { return existing_team.team_name == team.team_name })
    console.log("found a logged in team maybe:")
    console.log(existing_team);
    if (typeof existing_team == "undefined") {
      teams.push(team)
      localStorage.setItem("logged_in_teams", JSON.stringify(teams))
      electron.remote.getCurrentWindow().reload()
    } else {
      if (typeof team.icon_url != "undefined") {
        existing_team.icon_url = team.icon_url
        document.getElementById(existing_team.team_name + "_icon").style.backgroundImage = "url(" + team.icon_url + ")"
      }
    }
  }

  window.removeLoggedInTeam = function(team_name) {
    console.log("trying to remove:")
    console.log(team_name)
    delete(window.teamWebviews[team_name])
    var teams = loadTeamsFromStorage()

    existing_team = teams.find(function(existing_team) { return existing_team.team_name == team_name })
    console.log("existing team:")
    console.log(existing_team)
    if (typeof existing_team != "undefined") {
      teams.splice(teams.indexOf(existing_team), 1)
    }
    console.log("teams is now:")
    console.log(teams)
    localStorage.setItem("logged_in_teams", JSON.stringify(teams))
    window.loadTeams()
    activateWebview(teams[0].team_name)
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

    next.style.removeProperty("position")
    next.style.removeProperty("left")

    next.style.marginTop = "1px"
    next.style.marginLeft = "1px"
    next.classList.add("current")
    setTimeout(function() { next.style.marginTop = "0px" ; next.style.marginLeft = "0px"; }, 1)

    active_team.team_name = team_name
    var icons = document.getElementsByClassName("team_icon")
    for(var i=0; i < icons.length; i++) {
      icons[i].classList.remove("current")
    }
    var icon = document.getElementById(team_name + "_icon")
    icon.classList.add("current")
    focusCurrentTeam()
  }

  window.focusCurrentTeam = () => {
    getCurrentTeamWebview().focus()
  }

  window.getCurrentTeamWebview = () => {
    var active_team = document.getElementById("active_team");
    var currentDiv = window.teamWebviews[active_team.team_name]
    return currentDiv.getElementsByTagName('webview')[0]
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
          if (typeof team.icon_url === "string") {
            icon_div.style.backgroundImage = "url(" + team.icon_url + ")"
          }
          icon_div.team_name = team.team_name
          teams_div.appendChild(icon_div)
          var badge_div = document.createElement("div")
          badge_div.classList.add("badge")
          badge_div.id = team.team_name + "_badge"
          icon_div.appendChild(badge_div)
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
    if (event.target.classList.contains("team_icon")) {
      activateWebview(event.target.team_name)
      event.preventDefault();
      return
    } else if (event.target.classList.contains("update_div") ||
               event.target.classList.contains("message")) {
      window.hideUpdateMessage()
      event.preventDefault();
      return
    } else {
      return
    }
  }
  document.addEventListener("click", iconClickListener, true);

  function keyDownlistener(event) {
    // esc
    if (event.keyCode == 27) {
      window.hideUpdateMessage()
      return
    }
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    var index;
    // cmd-1 through cmd-9
    for (i = 49; i <= 57; i++) {
      if (event.keyCode === i) {
        index = i - 49;
      }
    }
    if (index === undefined) {
      return;
    }

    team = loadedTeams[index];
    if (team === undefined) {
      return;
    }

    activateWebview(team.team_name);
  };
  document.addEventListener("keydown", keyDownlistener, true);

  window.addEventListener('focus', () => { focusCurrentTeam() });

  window.hideUpdateMessage = function() {
    document.getElementsByClassName('update_div')[0].classList.remove("displayed")
  }

  window.showUpdateMessage = function() {
    document.getElementsByClassName('update_div')[0].classList.add("displayed")
  }
  window.showUpdateMessage()
}).call()
