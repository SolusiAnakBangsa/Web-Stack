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

        this._pauseMid;

        this.setup(pixiRef);
    }

    _redrawTransition() {
        this.transitionGraphic.clear();

        this.transitionGraphic.beginFill(0xF77D08);
        this.transitionGraphic.drawRect(
            this.app.screen.width/2 * (1-this._progress*1.2),
            this.app.screen.height/2 * (1-this._progress*1.2),
            this.app.screen.width * this._progress * 1.2,
            this.app.screen.height * this._progress * 1.2
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
            // Redraw transition object
            this._redrawTransition();

            // Increment for the progress
            const progressIncrement = delta / (1000 * this.duration);

            if (this._goingDirection) {
                // Increase the progress
                this._progress += progressIncrement;

                if (this._progress >= 1) {
                    // If _pauseMid is true, then pause the animation.
                    if (this._pauseMid)
                        this._going = false;

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

                    // Clear the transition shape.
                    this.transitionGraphic.clear();

                    if (this._callbackDone !== undefined) this._callbackDone();
                }
            }
        }
    }

    onResize() {
        
    }

    resume() {
        // Resumes the transition, if pauseMid is true, and a transition has reached midpoint.
        if (!this._going && this._progress >= 1 && this._pauseMid)
            this._going = true;
    }

    transition(callbackMid, callbackDone, pauseMid=false) {
        /*
        Does the transition.
        callbackMid will be called after the transition have covered the whole screen.
        callbackDone will be called after the whole transiion is done.
        pauseMid if true, transition will be paused when it has reached the mid point. resume() can be called to continue.
        */

       // Does the transition only if the transition has not begun.
        if (!this._going && this._progress <= 0) {
            this._going = true;
            this._goingDirection = true;
            this._callbackMid = callbackMid;
            this._callbackDone = callbackDone;
            this._pauseMid = pauseMid;
        }
    }
}