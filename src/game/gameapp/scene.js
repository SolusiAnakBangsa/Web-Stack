export class Scene {
    /* A Scene is basically a container that has all the
    Objects that will be rendered into the screen.
    All objects's loop method inside a scene will be run here too.

    This is very useful to separate objects when you want them to be inside
    different scenes, and this can be quickswitched.
    */

    // Can be inherited.
    
    constructor() {
        this.container = new PIXI.Container();
        this.objects = [];

        this.active = true;
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

    loop(delta) {
        if (this.active) {
            // Do the loop of every object.
            for (let obj of this.objects) {
                obj.loop(delta);
            }
        }
    }

    onResize() {
        if (this.active) {
            for (let obj of this.objects) {
                obj.onResize();
            }
        }
    }
}