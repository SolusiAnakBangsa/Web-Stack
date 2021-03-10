import { peer } from "./../../script/webrtc";
import { clamp } from "./../../script/util";

const RUNPOLL = 500; // Time in ms to update the running animation.

// Time in ms to retain the running pace.
// If the running pace is 100 and the user stops running, the pace will be 0 in RUNRETAIN ms.
const RUNRETAIN = 5000;

// Baseline for 100 Pace.
const MAXPACE = 4 // (4 steps/s) jj baseline

// Length of the buffer running
const RUNARRLEN = (RUNRETAIN/RUNPOLL) << 0;

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    JOG: 0,
});

export class GlobalController {

    constructor(app) {
        // App object (not pixi app)
        this.app = app;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        if ("exerciseType" in payload) {
            if (payload.exerciseType == "jog" && this.currentWorkout == Workouts.JOG) {
                if (this.lastRunObject === undefined) {
                    this.lastRunObject = {step: payload.repAmount, time: payload.time}; // Set
                    return;
                }
                // Step per second in the data.
                const dataDuration = (payload.time - this.lastRunObject.time); // Duration of data
                const stepTimeframe = (payload.repAmount - this.lastRunObject.step) * (dataDuration/RUNPOLL) * 100;
    
                // this.runQueue += clamp((stepPerS/MAXPACE) * 100 * dataDuration/RUNRETAIN, 0, 100);
                this.runQueue += stepTimeframe/MAXPACE;

                this.lastRunObject = {step: payload.repAmount, time: payload.time}; // Set before.
            }
        }
        // Pace calculator time
        // const maxSpeed = this.app.scene.speedRange[1];
        // const stepPerS = (payload.repAmount - this.lastRunObject.step) / ((payload.time - this.lastRunObject.time)/1000);
        // const maxSPS = 4 // (4/s) jj baseline

        // this.app.scene.runSpeed = clamp(stepPerS, 0, maxSPS)/4 * maxSpeed;

        // this.lastRunObject = {step: payload.repAmount, time: payload.time};
    }

    setup() {
        // Object to store workout data
        this.currentWorkout = Workouts.JOG;
        // this.targetPace = 0; // Target pace whe ncalculated based on the data received.
        this.runCounter = 0; // Stored to keep track of poll in time.
        this.runQueue = 0; // Queue to be added to target pace in the loop event.
        this.paceArrayCounter = 0; // Helper variable to
        this.paceArray = Array(RUNARRLEN).fill(0); // The size of this array is RUNPOLL/RUNRETAIN

        this.lastRunObject = undefined;

        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));
    }

    loop(delta) {
        this.runCounter += delta;

        // Update the running animation.
        if (this.runCounter > RUNPOLL) {

            // Update the array.
            this.paceArray[this.paceArrayCounter] = this.runQueue;
            this.paceArrayCounter = this.paceArrayCounter + 1 < RUNARRLEN ? this.paceArrayCounter + 1 : 0;
            this.runQueue = 0;

            // Set the running speed to be the array average.
            var avg = 0;
            for (var i = 0; i < RUNARRLEN; i++) {
                avg += this.paceArray[i];
            }
            avg /= RUNARRLEN;
            this.app.scene.setSpeed(clamp(avg, 0, 100)); // Set the speed of the scene.
            this.runCounter -= RUNPOLL;
        }
    }

    onResize() {
        
    }
}