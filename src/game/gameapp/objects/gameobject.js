export class GameObject {
    constructor(pixiRef, drawTo) {
        this.drawTo = drawTo;
        this.app = pixiRef.app;
        this.pixiRef = pixiRef;
        this.mainContainer = new PIXI.Container(); // This is the main container to store all the objects. Insert this to the stage to draw it.
    }

    setup() {
        // Add to the resizer events
    }

    loop() {}

    // Destroy the object here, remove all references from the app stage.
    destroy() {}

    // Deactivate the object. Don't draw and don't run the loop.
    setActive() {}

    // Resize event
    onResize() {}
}
