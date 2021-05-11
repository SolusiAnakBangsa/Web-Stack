import { GameApp } from "./gameapp/app";
import { IndexController } from "./gameapp/indexcontroller";
import { indexAssets } from "./gameapp/assets";

const $indexMan = document.getElementById("indexman");

const game = new GameApp({
    resolution: 1,
    backgroundColor: 0xF5F5F5,
    resizeTo: $indexMan, // Resize to the size of the browser window once.
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // Epic pixel look man!

document.addEventListener( 'DOMContentLoaded', function () {
    game.start($indexMan, IndexController, indexAssets, false);
});