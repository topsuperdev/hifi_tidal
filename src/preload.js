const { setTitle, getTitle } = require("./scripts/window-functions");
const { dialog } = require("electron").remote;
const hotkeys = require("./scripts/hotkeys");

const elements = {
  play: '*[data-test="play"]',
  pause: '*[data-test="pause"]',
  next: '*[data-test="next"]',
  previous: 'button[data-test="previous"]',
  title: '*[data-test^="footer-track-title"]',
  artists: '*[class^="mediaArtists"]',
  home: '*[data-test="menu--home"]',
  back: '[class^="backwardButton"]',
  forward: '[class^="forwardButton"]',
  search: '[class^="searchField"]',
  shuffle: '*[data-test="shuffle"]',
  repeat: '*[data-test="repeat"]',
  block: '[class="blockButton"]',
  account: '*[data-test^="profile-image-button"]',
  settings: '*[data-test^="open-settings"]',

  get: function(key) {
    return window.document.querySelector(this[key.toLowerCase()]);
  },

  getText: function(key) {
    return this.get(key).textContent;
  },

  click: function(key) {
    this.get(key).click();
    return this;
  },
  focus: function(key) {
    return this.get(key).focus();
  },
};

/**
 * Play or pause the current song
 */
function playPause() {
  const play = elements.get("play");

  if (play) {
    elements.click("play");
  } else {
    elements.click("pause");
  }
}

/**
 * Add hotkeys for when tidal is focused
 * Reflects the desktop hotkeys found on:
 * https://defkey.com/tidal-desktop-shortcuts
 */
function addHotKeys() {
  hotkeys.add("Control+p", function() {
    elements.click("account").click("settings");
  });
  hotkeys.add("Control+l", function() {
    handleLogout();
  });

  hotkeys.add("Control+h", function() {
    elements.click("home");
  });

  hotkeys.add("backspace", function() {
    elements.click("back");
  });

  hotkeys.add("shift+backspace", function() {
    elements.click("forward");
  });

  hotkeys.add("control+f", function() {
    elements.focus("search");
  });

  hotkeys.add("control+u", function() {
    // reloading window without cache should show the update bar if applicable
    window.location.reload(true);
  });

  hotkeys.add("control+left", function() {
    elements.click("previous");
  });

  hotkeys.add("control+right", function() {
    elements.click("next");
  });

  hotkeys.add("control+right", function() {
    elements.click("next");
  });

  hotkeys.add("control+s", function() {
    elements.click("shuffle");
  });

  hotkeys.add("control+r", function() {
    elements.click("repeat");
  });
}

/**
 * This function will ask the user whether he/she wants to log out.
 * It will log the user out if he/she selects "yes"
 */
function handleLogout() {
  const logoutOptions = ["Cancel", "Yes, please", "No, thanks"];

  dialog.showMessageBox(
    null,
    {
      type: "question",
      title: "Logging out",
      message: "Are you sure you want to log out?",
      buttons: logoutOptions,
      defaultId: 2,
    },
    function(response) {
      if (logoutOptions.indexOf("Yes, please") == response) {
        for (i = 0; i < window.localStorage.length; i++) {
          key = window.localStorage.key(i);
          if (key.startsWith("_TIDAL_activeSession")) {
            window.localStorage.removeItem(key);
            i = window.localStorage.length + 1;
          }
        }
        window.location.reload();
      }
    }
  );
}

/**
 * Add ipc event listeners.
 * Some actions triggered outside of the site need info from the site.
 */
function addIPCEventListeners() {
  window.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require("electron");

    ipcRenderer.on("getPlayInfo", (event, col) => {
      alert(`${elements.getText("title")} - ${elements.getText("artists")}`);
    });
  });
}

/**
 * Update window title
 */
setInterval(function() {
  const title = elements.getText("title");
  const artists = elements.getText("artists");
  const songDashArtistTitle = `${title} - ${artists}`;
  if (getTitle() !== songDashArtistTitle) {
    setTitle(songDashArtistTitle);
  }
}, 1000);

addHotKeys();
addIPCEventListeners();
