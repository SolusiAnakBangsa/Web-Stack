import { GameApp } from "./gameapp/app";
import { peer } from "./../script/webrtc";
import { GlobalController } from "./gameapp/globalcontroller";
import { assets } from "./gameapp/assets";

import { levelData } from "./gameapp/globalcontroller";
import { atics } from '../firebase/firebase';

// Audio when connected.
const audioObj = new Audio("audio/atmospheric.mp3");

// Initialize no sleep feature
const noSleep = new NoSleep();

// Game object
const game = new GameApp({
    resolution: 1,
    backgroundColor: 0x8febda,
    resizeTo: window, // Resize to the size of the browser window once.
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // Epic pixel look man!

// Here, lets initialize the webrtc object with a custom peerID
const peerId = Math.random().toString(36).slice(2).substr(0, 8);
peer.init(peerId);
peer.connection.addReceiveHandler((payload) => {
    // FIX: This should receive only once, then removes itself from the listener list.
    // Adds a listener to listen for the workout data from phone.
    if ("workoutList" in payload) {
        levelData.data = payload;
    }
});
peer.connection.addReceiveHandler((payload) => {
    // Endgame listener
    // Will update the end statistics.
    if (
        "status" in payload &&
        payload.status == "endgame" &&
        "meta" in payload
    ) {
        const calories = document.getElementById("calstat");
        const time = document.getElementById("timestat");

        const mili =
            payload.meta.totalTime === undefined ? 0 : payload.meta.totalTime;

        calories.innerText = payload.meta.calories;
        time.innerText = new Date(mili).toISOString().substr(11, 8);

        // Log the workout to google analytics
        atics.logEvent("workout_end", {
            time: mili,
            calories: payload.meta.calories
        });
    }
});
peer.connection.addEvents("open", () => {
    // Log analytics
    const uId = peerId + "-" + document.getElementById("gamecode").value;
    atics.setUserId(uId);
    atics.logEvent("workout_start", {
        uId: uId,
        time: (new Date()).getTime()
    });
    
    // This callback will be run when connection has been established
    // Successfully with the phone.
    const textbox = document.getElementById("gamecode");
    const playb = document.getElementById("playbutton");
    const flavor = document.getElementById("flavor");
    const screenItem = document.getElementById("screenitem");
    const peerForm = document.getElementById("peer_form");

    ExModule.showNotif("Connected!", "#22e0da");
    textbox.readOnly = true;
    playb.style.display = "none";
    flavor.innerText = "Let's go! Entering game...";

    // Enable no sleep mode
    noSleep.enable();

    // Remove the attribution screen.
    window.attributionToggle(false);
    
    // Scroll the website to topmost
    window.scrollTo(0, 0);

    setTimeout(() => {
        screenItem.style.opacity = 0;
    }, 2000);
    setTimeout(() => {
        peerForm.style.bottom = "100%";
    }, 4000);
    setTimeout(() => {
        ExModule.startGame();
        peerForm.style.display = "none";
    }, 8200);

    // Play connected sound
    audioObj.play();
});
peer.peer.on("error", function (err) {
    // Display error notif
    ExModule.showNotif(err, "#f27963");

    console.error("Peer Error: " + err);
    window.alert(
        "Phone is disconnected from browser. Activity will not be saved."
    );
});

const ExModule = {
    _notifTimeout: undefined, // Timeout reference for notification
    startGame() {
        var peerText = document.getElementById("top");
        peerText.style.display = "none";

        game.start(document.body, GlobalController, assets, true);
    },
    initMobileConnection() {
        // Get the game code
        const connectId = document.getElementById("gamecode").value;

        if (connectId == "" || connectId.length != 5) {
            this.showNotif("Please insert a valid game code.", "#f27963");
            return;
        }
        this.showNotif(`Connecting to "${connectId}"`, "#5c99fa");

        // Connect to the gamecode.
        peer.connectTo(connectId);
    },
    showNotif(msg, color) {
        const goneTimer = 5000;
        const notif = document.getElementById("ntf");
        notif.style.display = "block";
        notif.innerText = msg;
        notif.style.backgroundColor = color;

        // Timeout to make the notification disappear
        clearTimeout(this._notifTimeout);
        this._notifTimeout = setTimeout(() => {
            notif.style.display = "none";
        }, goneTimer);
    },
};

module.exports = ExModule;

// For testing only
// ExModule.startGame();
