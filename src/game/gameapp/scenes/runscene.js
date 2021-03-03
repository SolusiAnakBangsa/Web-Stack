import { Scene } from "./../scene";
import { Floor } from "./../objects/floor";
import { Sky } from "./../objects/sky";
import { RunMan } from "./../objects/runningman";
import { Pace } from "./../objects/pace";

export class RunScene extends Scene {
    
    constructor(pixiRef) {
        super(pixiRef);
        // The formula of runSpeed to animSpeed is runSpeed/2400

        this.speedRange = [0, 700]; // The range between min and max speed.

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

        this.pace = new Pace(pixiRef);

        this.addObj(this.floor);
        this.addObj(this.sky);
        this.addObj(this.runman);
        this.addObj(this.pace);
    }

    loopCode(delta) {
        const deltaS = delta/1000;

        this.floor.setFloorSpeed(this.runSpeed*deltaS);
        this.runman.speed = this.runSpeedToAnimSpeed(this.floor.floorSpeed);
        this.pace.pace = (this.runSpeed/this.speedRange[1]) * 100;
    }  

    onResizeCode() {

    }
}