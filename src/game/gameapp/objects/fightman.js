import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";

const GUYOFFSETY = 120;
const GUYOFFSETX = 270;

export class FightMan extends GameObject {

    constructor(pixiRef) {
        super(pixiRef);

        this.currentPose;
        this.currentSprite;

        this.setup(pixiRef);
    }

    start() {
        
    }

    setup(pixiRef) {

        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman.spineData);
        this.fightMan2 = new PIXI.spine.Spine(pixiRef.resources.fightman2.spineData);

        this.currentPose = this.fightMan;

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

        this.mainContainer.addChild(this.fightMan);
    
        // Setup the shadows
        this.manShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.fightMan.filters = [this.manShadow];
        this.fightMan2.filters = [this.manShadow];

        this.fightMan.scale.set(4);
        this.fightMan2.scale.set(4);

        // play animation
        this.fightMan.state.setAnimation(0, 'Idle', false);

        this.onResize();
    }

    loop(delta) {

    }

    repOnce() {
        // Does rep animation once.
        this.currentSprite.state.setAnimation(0, this.currentPose, false);
    }

    changePose(pose, loop) {
        // Clear the mainContainer
        this.mainContainer.removeChildren();

        // Get the corresponding sprite
        this.currentSprite = this.poseDictionary[pose];
        this.currentPose = pose.replace(/\s+/g, '');

        // Add the new fightman sprite
        this.mainContainer.addChild(this.currentSprite);

        let trackEntry = this.currentSprite.state.setAnimation(0, this.currentPose, loop);
        trackEntry.trackTime = trackEntry.animationEnd; // Sets the animation to be in the last frame.
    }

    onResize() {
        this.fightMan.position.set(
            GUYOFFSETX,
            this.app.screen.height - GUYOFFSETY
        );
        this.fightMan2.position.set(
            GUYOFFSETX,
            this.app.screen.height - GUYOFFSETY
        );

        this.manShadow.uniforms.floorY = this.fightMan.y;
    }
}