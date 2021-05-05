export class Scene {
    /* A Scene is basically a container that has all the
    Objects that will be rendered into the screen.
    All objects's loop method inside a scene will be run here too.

    Scenes can include loop and resize code too.

    This is very useful to separate objects when you want them to be inside
    different scenes, and this can be quickswitched.
    */

    // Can be inherited.
    
    constructor(pixiRef, controller) {
        // Override this
        this.container = new PIXI.Container();
        this._objects = [];
        this._controller = controller;

        this.active = true;
        this.isPaused = false;
        this.app = pixiRef.app;
        // FIX THIS IS WEIRD FIX THIS
        this.setup(pixiRef);
    }

    setup() {
        // Override this
    }

    start() {
        // Override this
    }

    setActive(boolean) {
        this.active = boolean;
        this.container.renderable = boolean;
        this.container.visible = boolean;
    }

    addObj(obj) {
        this._objects.push(obj);
        this.container.addChild(obj.mainContainer);
    }

    delObj(obj) {
        var c = 0;
        for (let ob of this._objects) {
            if (ob === obj) {
                this.container.removeChild(ob.mainContainer);
                this._objects.splice(c, 1);
                break;
            }
            c++;
        }
    }

    dataListener() {
        // Data listener. Will do events inside here when a new data has been received from phone.
    }

    loopCode() {
        // Override this
        // You put the actual code that you want to loop of the scene here.
    }

    loop(delta) {
        // This does not need to be inherited.
        if (this.active) {
            this.loopCode(delta);
            // Do the loop of every object.
            for (let obj of this._objects) {
                obj.loop(delta);
            }
        }
    }

    onResizeCode() {
        // Override this
        // You put the actual code to resize of the scene here.
    }

    switchCallback() {
        // This will be called once the scene is being switched
    }

    onResize() {
        // This does not need to be inherited.
        if (this.active) {
            this.onResizeCode();
            for (let obj of this._objects) {
                obj.onResize();
            }
        }
    }

    tapCallback() {
        // This will be called once the screen is clicked.
    }

    pauseCallback(isPaused) {
        // This will be called if the game is paused.
        this.isPaused = isPaused;
    }

    transitionCallback() {
        // Will be called when this scene is transitioned.
    }
}