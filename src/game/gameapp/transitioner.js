import { GameObject } from "./objects/gameobject";

const QLERP = (x) => Math.pow(x, 5);
const SLERP = (x) => Math.pow(x, 2);

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

        // vs attributes
        this._vsGoing = false;

        this._vsDuration = 3;
        this._vsDurationCounter = 0;

        this._vsStaticDuration = 5;
        this._vsStaticDurationCounter = 0;

        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman.spineData);
        this.fightMan.state.timeScale = 0.1

        this.enemySprite = new PIXI.Sprite(pixiRef.resources.enemypack.texture);
        this.enemySprite.anchor.set(0, 1);

        const vsStyle = new PIXI.TextStyle({
            dropShadow: true,
            dropShadowAngle: 0.7,
            dropShadowDistance: 9,
            fill: "white",
            fontFamily: "Times New Roman",
            fontSize: 320,
            fontStyle: "italic",
            fontWeight: "bold",
            letterSpacing: 18,
            lineHeight: 36,
            padding: 32,
            strokeThickness: 10
        });
        this.vsText = new PIXI.Text("V\n S", vsStyle);
        this.vsText.alpha = 0;
        this.vsText.anchor.set(0.5, 0.5);

        this.setup(pixiRef);
    }


    _basicTransition() {
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

    _vsInit() {
        this._vsGoing = true; // TODO: This jank, fix
        this.fightMan.scale.set(6);
        this.fightMan.state.setAnimation(0, 'idle', true);
        this.fightMan.x = -300;

        this.enemySprite.scale.set(3);
        this.enemySprite.x = this.app.screen.width;
        this.mainContainer.addChild(this.fightMan);
        this.mainContainer.addChild(this.enemySprite);
        this.mainContainer.addChild(this.vsText);
    }

    _vsTransition(delta) {
        const swidth = this.app.screen.width;
        const sheight = this.app.screen.height;

        this.transitionGraphic.clear();

        // Sliding main transition
        this.transitionGraphic.beginFill(0xF77D08);
        this.transitionGraphic.drawRect(
            this._goingDirection ? 0 : swidth * (1-QLERP(this._progress)),
            0,
            swidth * QLERP(this._progress),
            sheight
        );
        
        // 2 different durations are used here.
        // normal duration and static duration.
        // When progress mid, then add the vs duration counter.
        if (this._progress >= 1 && this._vsGoing) {
            // Cap progress at one point five.
            this._progress = 1.5;

            // Get the ratio
            let tProgress = this._vsDurationCounter/this._vsDuration;

            // Add the vs duration counter
            if (tProgress < 0.5 || this._vsStaticDurationCounter > this._vsStaticDuration) {
                this._vsDurationCounter += delta/1000;
            } else if (tProgress >= 0.5) {
                // Add the vs duration static counter
                this._vsStaticDurationCounter += delta/1000;
            }

            tProgress = tProgress > 0.5 ? (1-tProgress)*2 : tProgress*2;

            // Draws the frames
            const path1 = [
                0, sheight/2,
                swidth/2*SLERP(tProgress)*0.8, sheight/2,
                swidth/2*QLERP(tProgress)*1.2, sheight,
                0, sheight,
            ];
            const path2 = [
                swidth, 0,
                swidth-swidth/2*QLERP(tProgress)*1.2, 0,
                swidth-swidth/2*SLERP(tProgress)*0.8, sheight/2,
                swidth, sheight/2,
            ];
            this.transitionGraphic.beginFill(0xFFFFFF);
            this.transitionGraphic.drawPolygon(path1);
            this.transitionGraphic.drawPolygon(path2);

            // Man positioning
            this.fightMan.x = swidth/2*QLERP(tProgress)*0.65 - 200;
            this.enemySprite.x = swidth - swidth/2*QLERP(tProgress);

            // Text opacity
            this.vsText.alpha = QLERP(tProgress);
            
            // When the whole transition is done, this will be done.
            if (this._vsDurationCounter >= this._vsDuration) {
                this._vsDurationCounter = 0;
                this._vsStaticDurationCounter = 0;
                this._vsGoing = false;

                // Remove the sprites
                this.mainContainer.removeChild(this.fightMan);
                this.mainContainer.removeChild(this.enemySprite);
                this.mainContainer.removeChild(this.vsText);
            }
        }
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
            this._transitionType(delta);

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
        this.fightMan.y = this.app.screen.height+300;
        this.enemySprite.y = this.app.screen.height/2 + 200;
        this.vsText.position.set(this.app.screen.width/2, this.app.screen.height/2);
    }

    resume() {
        // Resumes the transition, if pauseMid is true, and a transition has reached midpoint.
        if (!this._going && this._progress >= 1 && this._pauseMid)
            this._going = true;
    }

    transition(callbackMid, callbackDone, transitionType=this._basicTransition, pauseMid=false) {
        /*
        Does the transition.
        callbackMid will be called after the transition have covered the whole screen.
        callbackDone will be called after the whole transiion is done.
        transitionType dictates which transition will this object use.
        pauseMid if true, transition will be paused when it has reached the mid point. resume() can be called to continue.
        */

       // Does the transition only if the transition has not begun.
        if (!this._going && this._progress <= 0) {
            this._going = true;
            this._goingDirection = true;
            this._callbackMid = callbackMid;
            this._callbackDone = callbackDone;
            this._pauseMid = pauseMid;
            this._transitionType = transitionType;

            if (transitionType === this._vsTransition) {
                this._vsInit();
            }
        }
    }
}