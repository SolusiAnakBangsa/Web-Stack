import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";

const GUYOFFSETY = 120;
const GUYOFFSETX = 270;

const TIMESCALEGLOBAL = 1.1; // Speed up the animations globally.

const INSTRUCTIONWIDTH = 600;
const INSTRUCTIONHEIGHT = 400;

class CharacterSpine {
    constructor(pixiRef) {

        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman.spineData);
        this.fightMan2 = new PIXI.spine.Spine(pixiRef.resources.fightman2.spineData);

        this.container = new PIXI.Container();
        this.currentSprite = this.fightMan;
        this.currentPose = "Idle";

        this.container.addChild(this.currentSprite);

        this.poseDictionary = {
            "Idle": this.fightMan,
            "Rhomboid Pull": this.fightMan2,
            "Sit Up": this.fightMan2,
            "Reclined Rhomboid Squeeze": this.fightMan2,
            "Squat": this.fightMan2,
            "Jumping Squat": this.fightMan2,
            "Jumping Jack": this.fightMan,
            "Push Up": this.fightMan2,
            "Knee Push Up": this.fightMan2,
            "Forward Lunge": this.fightMan2,
            "High Knee": this.fightMan2,
        }

        this.fightMan.state.timeScale = TIMESCALEGLOBAL;
        this.fightMan2.state.timeScale = TIMESCALEGLOBAL;

        this.fightMan.state.setAnimation(0, 'Idle', true);
    }

    changePose(pose, loop) {
        // Get the corresponding sprite
        this.container.removeChildren();

        this.currentSprite = this.poseDictionary[pose];
        this.currentPose = pose.replace(/\s+/g, '');

        this.container.addChild(this.currentSprite);

        let trackEntry = this.currentSprite.state.setAnimation(0, this.currentPose, loop);
        trackEntry.trackTime = trackEntry.animationEnd; // Sets the animation to be in the last frame.
    }
}

export class FightMan extends GameObject {

    constructor(pixiRef) {
        super(pixiRef);

        this.currentPose;
        this.currentSprite;

        this.setup(pixiRef);

        this.displayInstruction = false;
        this.instructionProgress = 0;
        this.instructionLerp = (x) => x*x*x*x*x;

        const ANIMATIONLENGTH = 1000; // ms
        this.lerpPeriod = (1000/ANIMATIONLENGTH)/60;
    }

    start() {
        
    }

    setup(pixiRef) {

        this.fightMan = new CharacterSpine(pixiRef);

        this.infoCont = new PIXI.Container();

        this.mainContainer.addChild(this.infoCont);
        this.mainContainer.addChild(this.fightMan.container);
    
        // Setup the shadows
        this.manShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.fightMan.fightMan.filters = [this.manShadow];
        this.fightMan.fightMan2.filters = [this.manShadow];

        this.fightMan.fightMan.scale.set(4);
        this.fightMan.fightMan2.scale.set(4);

        // Make instruction graphics
        this.instructionGraphics = new PIXI.Graphics();

        this.fightManAnim = new CharacterSpine(pixiRef);
        this.fightManAnim.fightMan.scale.set(2.5);
        this.fightManAnim.fightMan2.scale.set(2.5);

        this.fightManAnim.fightMan.position.set(
            -180,
            INSTRUCTIONHEIGHT/2 - 24
        );
        this.fightManAnim.fightMan2.position.set(
            -180,
            INSTRUCTIONHEIGHT/2 - 24
        );

        this.instructionContainer = new PIXI.Container();
        this.instructionGraphics.clear();
        this.instructionGraphics.beginFill(0xFFFFFF);
        this.instructionGraphics.drawRoundedRect(
            -INSTRUCTIONWIDTH/2,
            -INSTRUCTIONHEIGHT/2,
            INSTRUCTIONWIDTH,
            INSTRUCTIONHEIGHT,
            20
        );
        this.instructionGraphics.endFill();

        this.instructionContainer.addChild(this.instructionGraphics);
        this.instructionContainer.addChild(this.fightManAnim.container);

        this.onResize();
    }

    loop(delta) {
        let redrawInstruction = false;

        if (this.displayInstruction) {
            if (this.instructionProgress < 1) {
                if (this.instructionProgress >= 0) {
                    this.infoCont.addChild(this.instructionContainer);
                }
                this.instructionProgress += this.lerpPeriod;
                redrawInstruction = true;
            }
        } else {
            if (this.instructionProgress > 0) {
                this.instructionProgress -= this.lerpPeriod;
                redrawInstruction = true;
                if (this.instructionProgress <= 0) {
                    this.infoCont.removeChild(this.instructionContainer);
                }
            }
        }
        if (redrawInstruction) this._redrawInstruction();
    }

    repOnce() {
        // Does rep animation once.
        this.fightMan.currentSprite.state.setAnimation(0, this.currentPose, false);
    }

    onResize() {
        this.fightMan.fightMan.position.set(
            GUYOFFSETX,
            this.app.screen.height - GUYOFFSETY
        );
        this.fightMan.fightMan2.position.set(
            GUYOFFSETX,
            this.app.screen.height - GUYOFFSETY
        );

        this.manShadow.uniforms.floorY = this.fightMan.fightMan.y;

        this.instructionContainer.position.set(
            this.app.screen.width/2,
            this.app.screen.height/2
        );
    }

    setDisplayInstruction(isDisplayed) {
        this.displayInstruction = isDisplayed;
    }

    _redrawInstruction() {
        const centerX = this.app.screen.width/2;
        const centerY = this.app.screen.height/2;

        const lerp = this.instructionLerp(this.instructionProgress);

        this.instructionContainer.scale.set(lerp, lerp);
    }
}