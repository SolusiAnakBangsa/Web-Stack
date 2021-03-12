import { GameObject } from "./gameobject";

export class FightMan extends GameObject {

    constructor(pixiRef, seconds, callback=null) {
        super(pixiRef);


        this.setup(pixiRef);
    }

    start() {
        
    }

    setup(pixiRef) {
        this.fightMan = new PIXI.spine.Spine(pixiRef.resources.fightman.spineData);
        this.mainContainer.addChild(this.fightMan);
        this.mainContainer.position.set(400, 400);

        this.fightMan.scale.set(0.5);

        // set up the mixes!
        this.fightMan.stateData.setMix('walk', 'jump', 0.2);
        this.fightMan.stateData.setMix('jump', 'walk', 0.4);

        // play animation
        this.fightMan.state.setAnimation(0, 'walk', true);
    }

    loop(delta) {

    }

    onResize() {
        
    }
}