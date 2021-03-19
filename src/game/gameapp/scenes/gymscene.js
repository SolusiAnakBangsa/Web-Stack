import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";
import { FightMan } from "./../objects/fightman";
import { FightUI } from "./../objects/fightui";
import { Countdown } from "./../objects/countdown";

const RESTSECONDS = 15;
const CALLBACKDELAY = 5000; // Callback delay to do doneCallback

export class GymScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);

        // The workouts that will be done in this stage
        this.workouts; // {task: "", freq: 0}

        // The reps for the workout. Used for the workout progress bar
        this.currentReps = 0;

        // When the gym activity is done, callback will be run, after CALLBACKDELAY.
        this.doneCallback;

        // Current Workout index
        this.workoutIndex;

        // Whether the player is currently resting.
        this.resting = false;
    }

    startNewWorkout(workouts) {
        // Set a new workout routine that will be done in this stage.
        // This should reset every value, so that the gym cycle can begin anew.
        this.workouts = workouts;
        this.workoutIndex = 0;

        console.log(workouts);
        this.resting = false;

        // Randomize enemy to spawn.
        this.fightUI.changeEnemy();
        
        this._updateScores();
        this._updatePose();
        // this._addOne(); // Testing Purposes
    }

    _addOneRep() {

        // Only adds one rep if there is still workout to do.
        if (this.resting || this.workoutIndex >= this.workouts.length) return

        const maxRep = this.workouts[this.workoutIndex].freq;

        // Here, we decide whether all the reps have been done.
        if (this.currentReps < maxRep) {
            // Does rep animation
            this.fightMan.repOnce();

            // Increase the progress bar
            this.currentReps++;
            this.fightUI.workoutP = this.currentReps/maxRep;
            this.fightUI.workoutCounter.text = maxRep - this.currentReps;
            this.fightUI._redrawWorkoutBar();

            if (this.currentReps == maxRep) {
                // When this is the last rep, enter resting mode and set timeout
                // When animation finished to rest.
                this.resting = true;

                let callback;

                // Check whether this is the last workout.
                if (this.workoutIndex < this.workouts.length - 1) {
                    callback = () => {this._restBeforeNext(RESTSECONDS);}
                } else {
                    callback = () => {
                        this.workoutIndex++;
                        this._updateScores();
                        this._updatePose();
                    };
                }

                // Wait for the duration of the last workout, and additional 500ms.
                setTimeout(
                    callback,
                    this.fightMan.currentSprite.state.getCurrent(0).animation.duration*1000 + 500
                );
            }
        }
    }

    _updateScores() {
        // Updates some of the UI elements in the game
        // (Health, Workout text, Counter)

        if (this.workoutIndex < this.workouts.length) {
            // Update the texts
            this.fightUI.workoutCounter.text = this.workouts[this.workoutIndex].freq;
            this.fightUI.setWorkoutText(this.workouts[this.workoutIndex].task);
            this.fightUI.workoutP = 0;
            this.fightUI._redrawWorkoutBar();
        } else {
            // Obliterate the enemy
            this.fightUI.flyEnemy();

            // When all the workouts is done.
            this.fightUI.workoutCounter.text = "✅";
            this.fightUI.setWorkoutText("VICTORY!");
            this.fightUI.workoutP = 1;
            this.fightUI._redrawWorkoutBar();

            // Do callback if done.
            if (this.doneCallback !== undefined) setTimeout(this.doneCallback, CALLBACKDELAY);
        }

        // Update enemy health
        this.fightUI.enemyHealthP = (this.workouts.length - this.workoutIndex)/this.workouts.length;
        this.fightUI._redrawEnemyHealth();
    }

    _updatePose() {
        // Update pose depending on the current workout index
        if (this.workoutIndex < this.workouts.length) {
            this.fightMan.changePose(this.workouts[this.workoutIndex].task, false);
        } else {
            this.fightMan.changePose('Idle', true);
        }
    }

    _restBeforeNext(seconds) {
        // Create a countdown object that will callback
        // The next workout event.
        this.currentReps = 0;
        this.restCountdown.setSeconds(seconds);
        this.restCountdown.start();
        this.resting = true;

        // Update scores
        this.workoutIndex++;
        this._updateScores();

        // Add next workout text
        const textRef = this.fightUI.workoutText;
        textRef.text = "Next up:\n" + textRef.text;

        this.addObj(this.restCountdown);

        // Set the person animation to be idle.
        this.fightMan.changePose('Idle', true);
    }

    _nextWorkoutCountdown() {
        // After the countdown has completed, jump to the next workout.
        this.delObj(this.restCountdown);
        this.resting = false;

        // If next exists in the text, then delete it.
        const textRef = this.fightUI.workoutText;
        if (textRef.text.includes("\n")) {
            textRef.text = textRef.text.split("\n")[1];
        }
        
        // Change the pose
        this._updatePose();
    }

    _addOne() {
        // TEST: Testing Purposes only
        this._addOneRep();
        console.log("Add one.");
        setTimeout(this._addOne.bind(this), 2000);
    }

    dataListener(payload) {

        // TODO: Send start signal when starting a new exercise.
        // If a payload data that corresponds to the current workout is received, then increase rep by one.
        if ("exerciseType" in payload && this.workoutIndex < this.workouts.length) {
            if (payload.exerciseType == this.workouts[this.workoutIndex].task && payload.status == "mid") {
                this._addOneRep();
            }
        }
    }

    setup(pixiRef) {
        this.fightFloor = new FightFloor(pixiRef);
        this.fightMan = new FightMan(pixiRef);
        this.fightUI = new FightUI(pixiRef);
        this.restCountdown = new Countdown(pixiRef, null, this._nextWorkoutCountdown.bind(this));

        this.addObj(this.fightFloor);
        this.addObj(this.fightMan);
        this.addObj(this.fightUI);
    }

    loopCode(delta) {

    }

    start() {
        
    }

    onResizeCode() {
        
    }
}