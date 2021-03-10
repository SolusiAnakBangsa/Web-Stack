import { peer } from "./../../script/webrtc";
import { clamp } from "./../../script/util";

export class GlobalController {

    // Static enum to store all the workouts.
    static Workouts = Object.freeze({
        JOG: 0,
    });

    constructor(app) {
        // App object (not pixi app)
        this.app = app;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        // if ("exerciseType" in payload) {
        //     // Pace calculator time
        //     const maxSpeed = this.app.scene.speedRange[1];
        //     const stepPerS = (payload.repAmount - this.lastRunObject.step) / ((payload.time - this.lastRunObject.time)/1000);
        //     const maxSPS = 4 // (4/s) jj baseline

        //     this.app.scene.runSpeed = clamp(stepPerS, 0, maxSPS)/4 * maxSpeed;

        //     this.lastRunObject = {step: payload.repAmount, time: payload.time};
        // }
    }

    setup() {
        // Object to store workout data
        this.currentWorkout = GlobalController.Workouts.JOG;

        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));
    }

    loop(delta) {

    }

    onResize() {
        
    }
}