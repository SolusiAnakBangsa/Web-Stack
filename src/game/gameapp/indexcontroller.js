import { IndexScene } from "./scenes/indexscene";

export class IndexController {
    constructor(app) {
        // App object (not pixi app)
        this.appObj = app;
    }

    start(pixiRef) {
        this.pixiRef = pixiRef;
        // When global controller starts, set the first scene to be the running scene.
        this.indexScene = new IndexScene(this.pixiRef, this);

        this.appObj.setScene(this.indexScene);

        // Start the scene and trigger on resize.
        this.appObj.scene.start();
        this.appObj.scene.onResize();
    }

    setup() {

    }

    loop() {

    }

    onResize() {}
}
