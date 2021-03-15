import { assets } from "./assets";
import { Resizer } from "./resizer";
import { GlobalController } from "./globalcontroller";

export class GameApp {

    constructor(options) {
        // Creates the app according to the options
        this.options = options;
        this.scene;
        this.loaded = false; // Whether the resources have been loaded.
        this.loadCallback = []; // When game is loaded, run everything here.
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

        // Setup so that the user can interact with the screen.
        this.app.stage.interactive = true;

        // Start the controller
        this.controller.start(pixiRef);

        // Setups the main controller first.
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
        // // Everything in this function will be run, once the game is started.
        
        // Initializes the PIXI game instance with options.
        this.app = new PIXI.Application(this.options);
        this.loader = new PIXI.Loader(); // PIXI loader.
        this.resizer = new Resizer();
        this.controller = new GlobalController(this);

        // Change the HTML DOM display to be block.
        this.app.renderer.view.style.display = "block";

        // Add the renderer to the browser.
        document.body.appendChild(this.app.view);

        // Loads all the game data. When done, start the game.
        this.load();
    }

    setScene(scene) {
        if (this.scene == scene) return;
        // Remove previous scene from drawing
        if (this.scene !== undefined) {
            this.app.stage.removeChild(this.scene.container);
        }
        this.scene = scene;
        this.app.stage.addChild(scene.container);
        this.onResize();
    }

    loop(delta) {
        // Everything here will loop every frame
        // Do resizer event handler
        delta = this.app.ticker.deltaMS;
        this.resizer.loop(delta);

        this.controller.loop(delta);

        // Scene too
        if (this.scene !== undefined)
        this.scene.loop(delta);
    }

    onResize() {
        this.controller.onResize();

        if (this.scene !== undefined)
        this.scene.onResize();
    }
}