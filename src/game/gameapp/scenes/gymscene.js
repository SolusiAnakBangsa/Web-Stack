import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";
import { FightMan } from "./../objects/fightman";
import { FightUI } from "./../objects/fightui";

export class GymScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);
    }

    setup(pixiRef) {
        this.fightFloor = new FightFloor(pixiRef);
        this.fightMan = new FightMan(pixiRef);
        this.fightUI = new FightUI(pixiRef);

        this.addObj(this.fightFloor);
        this.addObj(this.fightMan);
        this.addObj(this.fightUI);
    }

    startTransition(data) {
        
    }

    loopCode(delta) {

    }

    start() {
        
    }

    onResizeCode() {
        
    }
}