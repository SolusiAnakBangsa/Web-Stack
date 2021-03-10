import { assets } from "./assets";
import { Resizer } from "./resizer";
import { RunScene } from "./scenes/runscene";
import { GlobalController } from "./globalcontroller";

export class GameApp {

    constructor(options) {
        // Creates the app according to the options
        this.app = new PIXI.Application(options);
        this.loader = new PIXI.Loader();
        this.resizer = new Resizer();
        this.controller = new GlobalController(this);
        this.scene;

        this.loaded = false; // Whether the resources have been loaded.
        this.loadCallback = []; // When game is loaded, run everything here.
        
        // Initializes the program
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
        
        // Make the scene
        // Add the scene to the main stage
        this.runScene = new RunScene(pixiRef);
        this.setScene(this.runScene);

        this.controller.setup();

        // Setup the loop
        this.app.ticker.add(this.loop.bind(this));
        this.resizer.add(this.onResize.bind(this));
        this.loaded = true;

        // Execute all callbacks
        for (let c of this.loadCallback) {
            c();
        }
    }

    start() {
        // Starts the game.
        if (this.loaded) {
            this.scene.start();
            // Call resize execution to be safe.
            this.scene.onResize();
        } else {
            this.loadCallback.push(this.start.bind(this));
        }
    }

    setScene(scene) {
        // Remove previous scene from drawing
        this.app.stage.removeChild(this.scene);
        this.scene = scene;
        this.app.stage.addChild(scene.container);
    }

    loop(delta) {
        // Everything here will loop every frame
        // Do resizer event handler
        this.resizer.loop(this.app.ticker.deltaMS);

        this.controller.loop(this.app.ticker.deltaMS);

        // Scene too
        if (this.scene !== undefined)
        this.scene.loop(this.app.ticker.deltaMS);
    }

    onResize() {
        this.controller.onResize();

        if (this.scene !== undefined)
        this.scene.onResize();
    }
}