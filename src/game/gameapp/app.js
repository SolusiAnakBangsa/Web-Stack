import { Resizer } from "./resizer";

/*
    Main controller for the application
*/
export class GameApp {
    constructor(options) {
        // Creates the app according to the options
        this.options = options;
        this.scene;
        this.loaded = false; // Whether the resources have been loaded.
        this.loadCallback = []; // When game is loaded, run everything here.

        // Loader variables
        this.loadBar; // Graphics object.
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

        // Delete loading bar.
        if (this.showLoading)
            this.app.stage.removeChild(this.loadBar);
    }

    /**
     * 
     * @param {HTMLElement} element HTML element that the game will be drawn to.
     * @param {*} controller        Main game controller for this instance.
     * @param {*} assetPack         Asset pack to load.
     * @param {boolean} load        Whether to spawn a loading bar.
     */
    start(element, controller, assetPack, load=false) {
        // Everything in this function will be run, once the game is started.

        // Initializes the PIXI game instance with options.
        this.app = new PIXI.Application(this.options);
        this.loader = new PIXI.Loader(); // PIXI loader.
        this.resizer = new Resizer();
        this.controller = new controller(this);
        this.showLoading = load;
        this.assets = assetPack;

        // Change the HTML DOM display to be block.
        this.app.renderer.view.style.display = "block";

        // Add the renderer to the browser.
        element.appendChild(this.app.view);

        if (load) {
            // Create a new pixi graphics, to show loading bar.
            this.loadBar = new PIXI.Graphics();
            this.app.stage.addChild(this.loadBar);
        }

        // Loads all the game data. When done, start the game.
        this._load();
    }

    setScene(scene) {
        if (this.scene == scene) return;

        // First, call a callback in the scene if exists.
        scene.switchCallback();

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
        if (this.scene !== undefined) this.scene.loop(delta);
    }

    onResize() {
        this.controller.onResize();

        if (this.scene !== undefined) this.scene.onResize();
    }

    _updateLoading() {
        const bar = this.loadBar;
        const screen = this.app.screen;

        bar.clear();
        bar.lineStyle(50, 0xf77d08, 1);
        bar.arc(
            screen.width / 2,
            screen.height / 2,
            160,
            -Math.PI / 2,
            -Math.PI / 2 + 2 * Math.PI * (this.loader.progress / 100)
        );
    }

    _load() {
        const loader = this.loader;

        for (let ast in this.assets) {
            const url = this.assets[ast];

            // Have to do EXACTLY this so that the gif works.
            if (url.endsWith(".gif")) {
                loader.add(url, {
                    loadType: PIXI.LoaderResource.LOAD_TYPE.XHR,
                    xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
                    crossOrigin:''
                });
            } else {
                loader.add(ast, this.assets[ast]);
            }
        }
        loader.load(this.setup.bind(this));

        // Whether to show the loading bar.
        if (this.showLoading)
            loader.onLoad.add(this._updateLoading.bind(this));
    }
}
