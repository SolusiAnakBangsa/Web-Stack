import { assets } from "./assets";
import { Resizer } from "./resizer";
import { RunScene } from "./scenes/runscene";
import { peer } from "./../../script/webrtc";

export class GameApp {

    // Static enum to store all the workouts.
    static Workouts = Object.freeze({
        JOG: 0,
    });

    constructor(options) {
        // Creates the app according to the options
        this.app = new PIXI.Application(options);
        this.loader = new PIXI.Loader();
        this.resizer = new Resizer();
        this.scene;

        this.loaded = false; // Whether the resources have been loaded.
        this.loadCallback = []; // When game is loaded, run everything here.
        
        this.currentWorkout = GameApp.Workouts.JOG;
        
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
        
        // Make the scene
        this.scene = new RunScene(pixiRef);
        
        // Add the scene to the main stage
        this.app.stage.addChild(this.scene.container);

        // Setup the loop
        this.app.ticker.add(this.loop.bind(this));
        this.resizer.add(this.onResize.bind(this));
        this.loaded = true;

        // Execute all callbacks
        for (let c of this.loadCallback) {
            c();
        }
        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));
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

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.
        console.log(payload);
    }

    loop(delta) {
        // Everything here will loop every frame
        // Do resizer event handler
        this.resizer.loop(this.app.ticker.deltaMS);

        // Scene too
        this.scene.loop(this.app.ticker.deltaMS);
    }

    onResize() {
        this.scene.onResize();
    }
}