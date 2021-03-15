import { GameObject } from "./objects/gameobject";

export class Transitioner extends GameObject {

    constructor(pixiRef, duration) {
        super(pixiRef);

        // Whether the transition is going on.
        this._going = false;
        // Transition going direction. true is fading in, false is fading out.
        this._goingDirection = true;

        // The progress of the transition. (0 = no transition, 1 = max transition)
        this._progress = 0;

        // Transition duration
        this.duration = duration !== undefined ? duration : 3;

        // Callbacks
        this._callbackMid;
        this._callbackDone;

        this.setup(pixiRef);
    }

    _redrawTransition() {
        this.transitionGraphic.clear();

        this.transitionGraphic.beginFill(0xF77D08);
        this.transitionGraphic.drawRect(
            0,
            0,
            this.app.screen.width * this._progress*1,
            this.app.screen.height * this._progress*1
        );

        this.transitionGraphic.endFill();
    }

    setup(pixiRef) {

        // Transition graphic.
        this.transitionGraphic = new PIXI.Graphics();

        this.mainContainer.addChild(this.transitionGraphic);

        this.onResize();
    }

    loop(delta) {
        // If the transition is ongoing, do some stuff.
        if (this._going) {
            // Increment for the progress
            const progressIncrement = delta / (1000 * this.duration);

            if (this._goingDirection) {
                // Increase the progress
                this._progress += progressIncrement;
                if (this._progress >= 1) {
                    // Turnback the direction, and do the callback.
                    this._goingDirection = false;
                    if (this._callbackMid !== undefined) this._callbackMid();
                }

            } else {
                // Decrease the progress
                this._progress -= progressIncrement;
                if (this._progress <= 0) {
                    // Stop the transition and do the callback.
                    this._going = false;
                    if (this._callbackDone !== undefined) this._callbackDone();
                }
            }
            this._redrawTransition();
        }
    }

    onResize() {
        
    }

    transition(callbackMid, callbackDone) {
        /*
        Does the transition.
        callbackMid will be called after the transition have covered the whole screen.
        callbackDone will be called after the whole transiion is done.
        */

       // Does the transition only if the transition has not begun.
        if (!this._going) {
            this._going = true;
            this._goingDirection = true;
            this._callbackMid = callbackMid;
            this._callbackDone = callbackDone;
        }
    }
}