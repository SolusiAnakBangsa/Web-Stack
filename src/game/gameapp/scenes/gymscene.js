import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";
import { FightMan } from "./../objects/fightman";

export class GymScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);
    }

    setup(pixiRef) {
        this.fightFloor = new FightFloor(pixiRef);
        this.fightMan = new FightMan(pixiRef);

        this.addObj(this.fightFloor);
        this.addObj(this.fightMan);
    }

    loopCode(delta) {

    }

    start() {
        
    }

    onResizeCode() {
        
    }
}