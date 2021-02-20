import { GameApp } from "./gameapp/app";


const game = new GameApp({
    resolution: 1,
    resizeTo: window, // Resize to the size of the browser window once.
});

// Change the DOM display to be block.
game.app.renderer.view.style.display = "block";

// Display in browser
document.body.appendChild(game.app.view);