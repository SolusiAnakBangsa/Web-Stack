import { peer } from "./../../script/webrtc";
import { clamp } from "./../../script/util";
import { RunScene } from "./scenes/runscene";
import { GymScene } from "./scenes/gymscene";

const RUNPOLL = 250; // Time in ms to update the running animation.

// Time in ms to retain the running pace.
// If the running pace is 100 and the user stops running, the pace will be 0 in RUNRETAIN ms.
const RUNRETAIN = 5000;

// Baseline for 100 Pace.
const MAXPACE = 4 // (4 steps/s) jj baseline

// Length of the buffer running
const RUNARRLEN = (RUNRETAIN/RUNPOLL) << 0;

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    NONE: 0,
    JOG: 1,
    GYM: 2, // Gym transition scene
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

                // Update steps in UI object
                this.app.scene.pace.setSteps(payload.repAmount);
            }
        }
    }

    setup() {

        // **** Objects to store workout data
        this.currentWorkout = Workouts.GYM;
        this.runCounter = 0; // Stored to keep track of poll in time.
        this.runQueue = 0; // Queue to be added to target pace in the loop event.
        this.paceArrayCounter = 0; // Helper variable to count the head in the array.
        this.paceArray = Array(RUNARRLEN).fill(0); // The size of this array is RUNPOLL/RUNRETAIN

        this.lastRunObject = undefined; // To help with difference.
        // ******

        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));
    }

    start(pixiRef) {
        this.pixiRef = pixiRef;
        // When global controller starts, set the first scene to be the unning scene.
        this.runScene = new RunScene(this.pixiRef, this);
        this.gymScene = new GymScene(this.pixiRef, this);
        this.app.setScene(this.runScene);
        // this.app.setScene(this.gymScene);
        // Start the scene and trigger on resize.
        this.app.scene.start();
        this.app.scene.onResize();

        this.currentWorkout = Workouts.NONE;
    }

    loop(delta) {
        switch (this.currentWorkout) {
            case Workouts.JOG:
                this.runCounter += delta;

                // Update the running animation.
                if (this.runCounter > RUNPOLL) {

                    // Update the array.
                    this.paceArray[this.paceArrayCounter] = this.runQueue;
                    this.paceArrayCounter = this.paceArrayCounter + 1 < RUNARRLEN ? this.paceArrayCounter + 1 : 0; // Add to the counter.
                    this.runQueue = 0; // Reset run queue

                    // Set the running speed to be the array average.
                    var avg = 0;
                    for (var i = 0; i < RUNARRLEN; i++) {
                        avg += this.paceArray[i];
                    }
                    avg /= RUNARRLEN;
                    this.app.scene.setSpeed(clamp(avg, 0, 100)); // Set the speed of the scene.
                    this.runCounter -= RUNPOLL;
                }
            break;
        }
    }

    onResize() {
        
    }
}