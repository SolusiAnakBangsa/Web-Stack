import { Scene } from "./../scene";
import { Floor } from "./../objects/floor";
import { Sky } from "./../objects/sky";
import { RunMan } from "./../objects/runningman";
import { Pace } from "./../objects/pace";
import { peer } from "./../../../script/webrtc";
import { clamp } from "./../../../script/util";

const RUNPOLL = 250; // Time in ms to update the running animation.

// Time in ms to retain the running pace.
// If the running pace is 100 and the user stops running, the pace will be 0 in RUNRETAIN ms.
const RUNRETAIN = 5000;

// Baseline for 100 Pace.
const MAXPACE = 4; // (4 steps/s) jj baseline

// Length of the buffer running
const RUNARRLEN = (RUNRETAIN / RUNPOLL) << 0;

// Speed range running speed
const SPEEDRANGE = [100, 700];

// Time in second to poll pace data.
const PACEDATAPOLL = 1000;

export class RunScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);
        // The formula of runSpeed to animSpeed is runSpeed/2400

        // **** Objects to store workout data
        this.runCounter = 0; // Stored to keep track of poll in time.
        this.runQueue = 0; // Queue to be added to target pace in the loop event.
        this.paceArrayCounter = 0; // Helper variable to count the head in the array.
        this.paceArray = Array(RUNARRLEN).fill(0); // The size of this array is RUNPOLL/RUNRETAIN

        this.lastRunObject = undefined; // To help with difference.

        this.targetSteps = 0; // Target steps to reach, before calling the callback.

        // When the run activity is done, callback will be run.
        this.doneCallback = () => {};
        // ******

        this.runSpeed = 0; // In pixel / second
        this.runSpeedToAnimSpeed = function () {
            return this.runSpeed / 2700;
        };

        // Variables to store historical data for pace.
        this.paceDataCounter = 0;
        this.paceData = [];

        this.paceCount = 0;

        this.totalSteps = 0;
    }

    setup(pixiRef) {
        // Animation attributes
        this.initYOffset = this.app.screen.height; // Offset to place the objects in.
        this.floatDuration = 5; // The amount of duration for floatDown.
        this.floatCounter = 0; // Counter for the duration.
        this.lerpFunction = (x) => 1 - Math.pow(1 - x, 3); // Interpolation function to use. (Ease out lerp)
        this.floatState = false; // The state whether to do the float down animation.

        // Make the objects
        // Make the floor object. and add then to the scene.

        this.floor = new Floor(pixiRef);

        this.sky = new Sky(pixiRef);

        this.runman = new RunMan(pixiRef);
        this.runman.speed = 0; // Initial

        this.pace = new Pace(pixiRef);

        // New countdown object.
        // Once countdown is done, start the game.

        this.addObj(this.floor);
        this.addObj(this.sky);
        this.addObj(this.runman);
        this.addObj(this.pace);
        this.onResize();
    }

    loopCode(delta) {
        const deltaS = delta / 1000;

        // Set floorspeed according to delta.
        this.floor.setFloorSpeed(this.runSpeed * deltaS);

        // Only does it when paused.
        if (!this.isPaused) {
            if (this.floatState) {
                // Calculate offset
                const curOffset =
                    this.initYOffset *
                    (this.lerpFunction(
                        (this.floatCounter + deltaS) / this.floatDuration
                    ) -
                        this.lerpFunction(
                            this.floatCounter / this.floatDuration
                        ));

                // Increase the position
                this.floor.mainContainer.y -= curOffset * 2;
                this.runman.mainContainer.y -= curOffset * 2;
                this.sky.mainContainer.y -= curOffset;

                // Increase the duration.
                this.floatCounter += deltaS;

                // Stop the animation once it reaches floatDuration.
                // and send a trigger that the animation is completed.
                if (this.floatCounter > this.floatDuration) {
                    this.floatState = false;
                    this.animationDone();
                }
            }

            // Poll pace data
            this.paceDataCounter += delta;

            if (this.paceDataCounter > PACEDATAPOLL) {
                this.paceData.push(this.paceCount);
                this.paceDataCounter -= PACEDATAPOLL;
            }

            // Run code
            this.runCounter += delta;

            // Update the running animation.
            if (this.runCounter > RUNPOLL) {
                // Update the array.
                this.paceArray[this.paceArrayCounter] = this.runQueue;
                this.paceArrayCounter =
                    this.paceArrayCounter + 1 < RUNARRLEN
                        ? this.paceArrayCounter + 1
                        : 0; // Add to the counter.
                this.runQueue = 0; // Reset run queue

                // Set the running speed to be the array average.
                var avg = 0;
                for (var i = 0; i < RUNARRLEN; i++) {
                    avg += this.paceArray[i];
                }
                avg /= RUNARRLEN;
                this.paceCount = clamp(avg, 0, 100);
                this.setSpeed(this.paceCount); // Set the speed of the scene.

                this.runCounter -= RUNPOLL;
            }
        }
    }

    start() {}

    setAbove() {
        // Function to set every object to be at bottom.
        this.floor.mainContainer.y += this.initYOffset * 2;
        this.runman.mainContainer.y += this.initYOffset * 2;
        this.sky.mainContainer.y += this.initYOffset;
    }

    setSpeed(speed) {
        // 0-100
        if (speed > 10) {
            this.runSpeed =
                SPEEDRANGE[0] + (speed / 100) * (SPEEDRANGE[1] - SPEEDRANGE[0]);
            this.runman.speed = this.runSpeedToAnimSpeed();
            this.pace.pace = speed;
        } else {
            this.runSpeed = 0;
            this.runman.speed = 0;
            this.pace.pace = 0;
        }
    }

    switchCallback() {
        // Reset the pace array.
        this.paceArray = Array(RUNARRLEN).fill(0);
    }

    dataListener(payload) {
        if ("exerciseType" in payload) {
            if (payload.exerciseType == "Jog") {
                // // Check if current step is more than the target to call the callback to gym.
                // if (payload.repAmount >= this.targetSteps) {
                //     this.doneCallback();
                // }

                if (payload.status == "start") {
                    this.lastRunObject = {
                        step: payload.repAmount,
                        time: payload.time,
                    }; // Sets
                } else if (payload.status == "mid" || payload.status == "end") {
                    if (this.lastRunObject === undefined) {
                        this.lastRunObject = {
                            step: payload.repAmount,
                            time: payload.time,
                        }; // Set
                    }
                    // Step per second in the data.
                    const dataDuration = payload.time - this.lastRunObject.time; // Duration of data
                    const deltaStep =
                        payload.repAmount - this.lastRunObject.step;
                        
                    const stepTimeframe =
                        deltaStep * (dataDuration / RUNPOLL) * 100;

                    // this.runQueue += clamp((stepPerS/MAXPACE) * 100 * dataDuration/RUNRETAIN, 0, 100);
                    this.runQueue += stepTimeframe / MAXPACE;

                    this.lastRunObject = {
                        step: payload.repAmount,
                        time: payload.time,
                    }; // Set before.

                    this.totalSteps += deltaStep;

                    // Update steps in UI object
                    this.pace.setSteps(this.totalSteps);

                    if (payload.status == "end") {
                        this.doneCallback();
                    }
                }
            }
        }
    }

    animationDone() {
        this.onResize();
    }

    floatDown() {
        // Function to pan down to the game, starting it.
        this.floatState = true;
        this.setAbove();
    }

    onResizeCode() {}

    pauseCallback(isPaused) {
        super.pauseCallback(isPaused);
        this.runman.paused = isPaused;
        this.floor.paused = isPaused;
    }

    transitionCallback() {
        // Send signal to the phone to start.
        peer.connection.sendData({ status: "startnext" });
    }
}
