import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";

const GUYOFFSETY = 120;
const GUYOFFSETX = 270;

export class FightMan extends GameObject {

    constructor(pixiRef) {
        super(pixiRef);

        this.setup(pixiRef);
    }

    start() {
        
    }

    setup(pixiRef) {

        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman.spineData);
        this.fightMan2 = new PIXI.spine.Spine(pixiRef.resources.fightman2.spineData);

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
        }

        this.mainContainer.addChild(this.fightMan);
    
        // Setup the shadows
        this.manShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.fightMan.filters = [this.manShadow];
        this.fightMan2.filters = [this.manShadow];

        this.fightMan.scale.set(4);
        this.fightMan2.scale.set(4);

        // // set up the mixes!
        // this.fightMan.stateData.setMix('walk', 'jump', 0.2);
        // this.fightMan.stateData.setMix('jump', 'walk', 0.4);

        // // play animation
        this.fightMan.state.setAnimation(0, 'Idle', true);

        this.onResize();
    }

    loop(delta) {

    }

    changePose(pose) {
        // Clear the mainContainer
        this.mainContainer.removeChildren();

        // Get the corresponding sprite
        const sprite = this.poseDictionary[pose];

        // Add the new fightman sprite
        this.mainContainer.addChild(sprite);
        console.log(pose.replace(/\s+/g, ''));
        sprite.state.setAnimation(0, pose.replace(/\s+/g, ''), true);
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