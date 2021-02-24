export class GameObject {
    constructor(pixiRef, drawTo) {

        this.drawTo = drawTo;
        this.app = pixiRef.app;
        this.pixiref = pixiRef;
    }

    setup(pixiRef) {
        // Add to the resizer events
        pixiRef.resizer.add(this.onResize.bind(this));
    }

    loop(delta) {}

    // Destroy the object here, remove all references from the app stage.
    destroy() {}

    // Deactivate the object. Don't draw and don't run the loop.
    setActive(state) {}

    // Resize event
    onResize() {}
}