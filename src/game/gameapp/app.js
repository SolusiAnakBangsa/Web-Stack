import { assets } from "./assets";
import { Floor } from "./objects/floor";
import { Sky } from "./objects/sky";
import { Resizer } from "./resizer";
import { RunMan } from "./objects/runningman";

export class GameApp {

    constructor(options) {
        // Creates the app according to the options
        this.app = new PIXI.Application(options);
        this.loader = new PIXI.Loader();
        this.resizer = new Resizer();
        
        // Initializes the program
        this.initialize();
    }

    initialize() {
        // This is the method to initialize all the game
        // functionality with loaders, and tickers.
        this.load();
    }

    load() {
        for (let ast in assets) {
            this.loader.add(ast, assets[ast]);
        }
        this.loader.load(this.setup.bind(this));
    }

    setup(loader, resources) {
        // This object is useful to store all the references needed by objects
        // When creating. All `Object` classes has pixiRef as the constructor argument.
        const pixiRef = {
            app: this.app,
            loader: loader,
            resources: resources,
            resizer: this.resizer,
        };

        // Make the floor object.
        this.floor = new Floor(pixiRef, this.app.stage);
        this.sky = new Sky(pixiRef, this.app.stage);
        this.runman = new RunMan(pixiRef, this.app.stage);
        this.runman.speed = 0.25;

        // Setup the loop
        this.app.ticker.add(this.loop.bind(this));
    }

    loop(delta) {
        // Everything here will loop every frame

        // Do resizer event handler
        this.resizer.loop(this.app.ticker.deltaMS);
        this.floor.loop(this.app.ticker.deltaMS);
        this.sky.loop(this.app.ticker.deltaMS);
        this.runman.loop(this.app.ticker.deltaMS);
    }
}