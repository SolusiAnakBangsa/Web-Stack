import { GameApp } from "./gameapp/app";


const game = new GameApp({
    resolution: 1,
    backgroundColor: 0x8febda,
    resizeTo: window, // Resize to the size of the browser window once.
});

// Epic pixel look man!
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// Change the DOM display to be block.
game.app.renderer.view.style.display = "block";

// Display in browser
document.body.appendChild(game.app.view);