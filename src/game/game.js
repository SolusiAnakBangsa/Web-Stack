import { GameApp } from "./gameapp/app";
import { peer } from "./../script/webrtc";
import { GlobalController } from "./gameapp/globalcontroller"

// Game object
const game = new GameApp({
    resolution: 1,
    backgroundColor: 0x8febda,
    resizeTo: window, // Resize to the size of the browser window once.
});

// Epic pixel look man!
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// Here, lets initialize the webrtc object with a custom peerID
peer.init(Math.random().toString(36).slice(2).substr(0, 8));

peer.connection.addReceiveHandler((payload) => {
    // FIX: This should receive only once, then removes itself from the listener list.
    // Adds a listener to listen for the workout data from phone.
    if ("workoutList" in payload) {
        GlobalController.levelData = payload;
    }
});

peer.connection.addReceiveHandler((payload) => {
    // Endgame listener
    // Will update the end statistics.
    if ("status" in payload) {
        if (payload.status == "endgame") {
            // Check if meta exist first.
            if ("meta" in payload) {
                const calories = document.getElementById("calstat");
                const time = document.getElementById("timestat");

                const mili = payload.totalTime === undefined ? 0 : payload.totalTime;

                calories.innerText = payload.calories === undefined ? "Null" : payload.calories;
                time.innerText = (new Date(mili)).toISOString().substr(11, 8);
            }
        }
    }
});

peer.connection.addEvents('open', () => {
    // This callback will be run when connection has been established
    // Successfully with the phone.
    const notif = document.getElementById("ntf");
    const textbox = document.getElementById("gamecode");
    const playb = document.getElementById("playbutton");
    const flavor = document.getElementById("flavor");
    const screenItem = document.getElementById("screenitem");
    const peerForm = document.getElementById("peer_form");
    
    notif.innerText = "Connected!";
    notif.style.display = "block";
    notif.style.backgroundColor = "#22e0da";
    notif.style.padding = "17.5px 50px 17.5px 50px";

    textbox.readOnly = true;
    playb.style.display = "none";

    flavor.innerText = "Let's go! Entering game...";

    setTimeout(() => {screenItem.style.opacity = 0;}, 2000);
    setTimeout(() => {peerForm.style.bottom = "100%";}, 4000);
    setTimeout(() => {
        ExModule.startGame();
        peerForm.style.display = "none";
    }, 8200);
});

peer.peer.on('error', function(err){
    // Display error notif
    const notif = document.getElementById("ntf");

    notif.style.display = "block";
    notif.style.backgroundColor = "#f27963";
    notif.innerText = err;
});

class ExModule {
    static startGame() {
        var peerText = document.getElementById("peer_form");
        peerText.style.display = "none";

        game.start();
    }

    static initMobileConnection() {
        // Get the game code
        const connectId = document.getElementById("gamecode").value;
        const notif = document.getElementById("ntf");

        if (connectId == "" || connectId.length != 5) {
            notif.innerText = "Please insert a valid game code.";
            notif.style.display = "block";
            notif.style.backgroundColor = "#f27963";
            return;
        }

        notif.innerText = `Connecting to "${connectId}"`;
        notif.style.display = "block";
        notif.style.backgroundColor = "#5c99fa";

        // Connect to the gamecode.
        peer.connectTo(connectId);
    }
}

module.exports = ExModule;

// For testing only
// ExModule.startGame();