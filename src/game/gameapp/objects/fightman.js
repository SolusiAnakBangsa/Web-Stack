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
        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman2.spineData);
        this.mainContainer.addChild(this.fightMan);
    
        // Setup the shadows
        this.manShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.fightMan.filters = [this.manShadow];

        this.fightMan.scale.set(4);

        // // set up the mixes!
        // this.fightMan.stateData.setMix('walk', 'jump', 0.2);
        // this.fightMan.stateData.setMix('jump', 'walk', 0.4);

        // // play animation
        this.fightMan.state.setAnimation(0, 'pushupknee', true);

        this.onResize();
    }

    loop(delta) {

    }

    onResize() {
        this.fightMan.position.set(
            GUYOFFSETX,
            this.app.screen.height - GUYOFFSETY
        );

        this.manShadow.uniforms.floorY = this.fightMan.y;
    }
}