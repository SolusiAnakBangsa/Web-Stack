export class Scene {
    /* A Scene is basically a container that has all the
    Objects that will be rendered into the screen.
    All objects's loop method inside a scene will be run here too.

    Scenes can include loop and resize code too.

    This is very useful to separate objects when you want them to be inside
    different scenes, and this can be quickswitched.
    */

    // Can be inherited.
    
    constructor(pixiRef) {
        this.container = new PIXI.Container();
        this.objects = [];

        this.active = true;
        this.setup(pixiRef);
    }

    setup(pixiRef) {

    }

    setActive(boolean) {
        this.active = boolean;
        this.container.renderable = boolean;
        this.container.visible = boolean;
    }

    addObj(obj) {
        this.objects.push(obj);
        this.container.addChild(obj.mainContainer);
    }

    loopCode(delta) {
        // You put the actual code that you want to loop of the scene here.
    }

    loop(delta) {
        // This does not need to be inherited.
        if (this.active) {
            this.loopCode(delta);
            // Do the loop of every object.
            for (let obj of this.objects) {
                obj.loop(delta);
            }
        }
    }

    onResizeCode() {
        // You put the actual code to resize of the scene here.
    }

    onResize() {
        // This does not need to be inherited.
        if (this.active) {
            this.onResizeCode();
            for (let obj of this.objects) {
                obj.onResize();
            }
        }
    }
}