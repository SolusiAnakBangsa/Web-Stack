import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";

export class GymScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);
    }

    setup(pixiRef) {
        this.fightFloor = new FightFloor(pixiRef);

        this.addObj(this.fightFloor);
    }

    loopCode(delta) {

    }

    start() {
        
    }

    onResizeCode() {
        
    }
}