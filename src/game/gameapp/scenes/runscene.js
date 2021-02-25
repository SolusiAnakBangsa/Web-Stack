import { Scene } from "./../scene";
import { Floor } from "./../objects/floor";
import { Sky } from "./../objects/sky";
import { RunMan } from "./../objects/runningman";

export class RunScene extends Scene {
    
    constructor(pixiRef) {
        super(pixiRef);
        // The formula of runSpeed to animSpeed is runSpeed/2400

        this.runSpeed = 500; // In pixel / second
        this.runSpeedToAnimSpeed = function (floorSpeed) { return this.runSpeed/2700 };
    }

    setup(pixiRef) {
        // Make the objects
        // Make the floor object. and add then to the scene.
        this.floor = new Floor(pixiRef);
        this.sky = new Sky(pixiRef);
        this.runman = new RunMan(pixiRef);

        this.runman.speed = 0.25; // Initial

        this.addObj(this.floor);
        this.addObj(this.sky);
        this.addObj(this.runman);
    }

    loopCode(delta) {
        const deltaS = delta/1000;

        this.floor.floorSpeed = this.runSpeed*deltaS;
        this.runman.speed = this.runSpeedToAnimSpeed(this.floor.floorSpeed);
    }  

    onResizeCode() {

    }
}