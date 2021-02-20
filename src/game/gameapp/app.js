import { assets } from "./assets";
import { Floor } from "./objects/floor";

export class GameApp {

    constructor(options) {
        // Creates the app according to the options
        this.app = new PIXI.Application(options);
        this.loader = new PIXI.Loader();
        
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
        };

        this.floor = new Floor(pixiRef, this.app.stage);
    }
}