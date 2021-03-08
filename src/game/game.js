import { GameApp } from "./gameapp/app";
import { peer } from "./../script/webrtc";

const game = new GameApp({
    resolution: 1,
    backgroundColor: 0x8febda,
    resizeTo: window, // Resize to the size of the browser window once.
});

// Epic pixel look man!
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// Change the DOM display to be block.
game.app.renderer.view.style.display = "block";

class ExModule {
    static toggleGame() {
        var peerText = document.getElementById("peer_form");
        peerText.style.display = "none";

        // Display in browser
        document.body.appendChild(game.app.view);
    }

    static initMobileConnection() {
        // Makes the connection
        if (peer.connection == undefined) {
            // Generate random peer ID
            peer.init(Math.random().toString(36).slice(2).substr(0, 8));
        }
        // Connect to the gamecode.
        peer.connectTo("B");
    }
}

module.exports = ExModule;