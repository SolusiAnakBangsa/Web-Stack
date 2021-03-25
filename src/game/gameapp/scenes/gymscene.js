import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";
import { FightMan } from "./../objects/fightman";
import { FightUI } from "./../objects/fightui";
import { Countdown } from "./../objects/countdown";
import { peer } from "./../../../script/webrtc";
import { Button } from "./../objects/button";

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

        // Prev rep, to keep track of payload reps.
        this.prevRep;

        // Whether the player is currently resting.
        this.resting = false;
    }

    startNewWorkout(workouts) {
        // TODO: This can be inside transition callback
        // Set a new workout routine that will be done in this stage.
        // This should reset every value, so that the gym cycle can begin anew.
        this.workouts = workouts;
        this.workoutIndex = -1;

        this.currentReps = 0;

        this.prevRep = 0;

        // Set resting to be true.
        this.resting = true;

        // Set the first workout in x seconds.
        // Show the countdown too.
        this._restCountdown(20);

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
        }

        this.repSound.play();
    }

    _lastRep() {
        // Will be called if in the last rep.
        // When this is the last rep, enter resting mode and set timeout
        // When animation finished to rest.
        this.resting = true;

        let callback;

        // Check whether this is the last workout.
        if (this.workoutIndex < this.workouts.length - 1) {
            callback = () => {this._restCountdown(RESTSECONDS);}
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
            this.fightMan.fightMan.currentSprite.state.getCurrent(0).animation.duration*1000 + 500
        );
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
            this.fightUI.updateInstruction(this.workouts[this.workoutIndex].task)
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
            this.fightMan.fightMan.changePose(this.workouts[this.workoutIndex].task, false);
        } else {
            this.fightMan.fightMan.changePose('Idle', true);
        }
    }

    _restCountdown(seconds) {
        // Create a countdown object that will callback
        // The next workout event.
        // This will be called after the user have completed an exercise
        // and there is still next exercise.
        this.prevRep = 0;
        this.currentReps = 0;
        this.restCountdown.setSeconds(seconds);
        this.restCountdown.start();
        this.resting = true;

        // Damage the enemy here, do animations.
        this.fightUI.enemy.state.setAnimation(0, 'fly', false);
        this.fightUI.enemy.state.addAnimation(0, 'idle', true, 0);

        // Summon the buttons
        this.addObj(this.skipButton);
        this.addObj(this.delayButton);

        // Add next workout text
        const textRef = this.fightUI.workoutText;
        textRef.text = "Next up:\n" + textRef.text;

        // Update scores
        this.workoutIndex++;
        this._updateScores();

        this.addObj(this.restCountdown);

        // Set the person animation to be idle.
        this.fightMan.fightMan.changePose('Idle', true);

        // Display the instruction screen.
        this.fightUI.setDisplayInstruction(true);

        // Play sound.
        this.nextWorkoutSound.play();
    }

    _goToNextWorkout() {
        // This event will be run after the resting countdown have been completed.
        // After the countdown has completed, jump to the next workout.
        this.delObj(this.restCountdown);
        this.resting = false;

        // Delete the buttons
        this.delObj(this.skipButton);
        this.delObj(this.delayButton);

        // If next exists in the text, then delete it.
        const textRef = this.fightUI.workoutText;
        if (textRef.text.includes("\n")) {
            textRef.text = textRef.text.split("\n")[1];
        }

        peer.connection.sendData({"status" : "startnext"});
        
        // Change the pose
        this._updatePose();
        
        // Remove the display instruction
        this.fightUI.setDisplayInstruction(false);

        // Play sound.
        this.nextWorkoutSound.play();
    }

    _addOne() {
        // TEST: Testing Purposes only
        this._addOneRep();
        console.log("Add one.");
        setTimeout(this._addOne.bind(this), 2000);
    }

    dataListener(payload) {

        // If a payload data that corresponds to the current workout is received, then increase rep by one.

        if ("exerciseType" in payload && this.workoutIndex < this.workouts.length) {
            if (payload.exerciseType == this.workouts[this.workoutIndex].task &&
                (payload.status == "mid" ||
                payload.status == "end") &&
                this.prevRep < payload.repAmount)
            {
                
                const repAmount = payload.repAmount - this.prevRep;
                this.prevRep = payload.repAmount;
                for (var i = 0; i < repAmount; i++)
                    this._addOneRep();

                if (payload.status == "end") {
                    this._lastRep();
                }
            }
        }
    }

    switchCallback() {

    }

    setup(pixiRef) {
        this.floatState = false; // The state whether to do the float down animation.
        this.lerpFunction = (x) => 1 - Math.pow(1 - x, 3); // Interpolation function to use. (Ease out lerp)
        this.initYOffset = pixiRef.app.screen.height; // Offset to place the objects in.
        this.floatCounter = 0;
        this.floatDuration = 5; // The amount of duration for floatDown.

        this.fightFloor = new FightFloor(pixiRef);
        this.fightMan = new FightMan(pixiRef);
        this.fightUI = new FightUI(pixiRef);
        this.restCountdown = new Countdown(pixiRef, null, this._goToNextWorkout.bind(this));

        // Set the position of the countdown.
        this.restCountdown.xPos = (scr) => scr.width/2 - 175;
        this.restCountdown.yPos = (scr) => scr.height/2 - 113;

        this.infoButton = new Button(
            pixiRef,
            "help_outline",
            () => {
                this.fightUI.setDisplayInstruction(!this.fightUI.displayInstruction);
            },
            () => 32,
            () => 96 + 16,
            64,
            0x00AAAA
        );

        // Skip button.
        this.skipButton = new Button(
            pixiRef,
            "skip_next",
            () => {
                this.restCountdown.counter = 1;
            },
            () => 32,
            () => 160 + 32,
            64,
            0x00AAAA
        );

        // Delay 5 second button
        this.delayButton = new Button(
            pixiRef,
            "forward_5",
            () => {
                this.restCountdown.counter += 5;
            },
            () => 32,
            () => 224 + 48,
            64,
            0x00AAAA
        );

        this.addObj(this.fightFloor);
        this.addObj(this.fightMan);
        this.addObj(this.fightUI);
        this.addObj(this.infoButton);

        this.nextWorkoutSound = pixiRef.resources.nextsound.sound;
        this.repSound = pixiRef.resources.repsound.sound;
    }

    floatDown() {
        // Function to pan down to the game, starting it.
        this.floatState = true;
        this.setAbove();
    }

    setAbove() {
        // Function to set every object to be at bottom.
        this.fightFloor.mainContainer.y += this.initYOffset;
        this.fightMan.mainContainer.y += this.initYOffset;
        this.fightUI.enemyCont.y += this.initYOffset;
    }

    loopCode(delta) {
        if (this.floatState) {
            const deltaS = delta/1000;

            // Calculate offset
            const curOffset = this.initYOffset * (this.lerpFunction((this.floatCounter + deltaS)/this.floatDuration) - this.lerpFunction(this.floatCounter/this.floatDuration));

            // Increase the position
            this.fightFloor.mainContainer.y -= curOffset;
            this.fightMan.mainContainer.y -= curOffset;
            this.fightUI.enemyCont.y -= curOffset;

            this.fightMan.manShadow.uniforms.floorY = this.fightMan.mainContainer.y + this.fightMan.fightMan.fightMan.y;
            this.fightUI.enemyShadow.uniforms.floorY = this.fightUI.enemyCont.y + (this.fightUI.enemy.y + this.fightUI.enemyPosOffset.y);

            // Increase the duration.
            this.floatCounter += deltaS;

            // Stop the animation once it reaches floatDuration.
            // and send a trigger that the animation is completed.
            if (this.floatCounter > this.floatDuration) {
                this.floatState = false;
                this.animationDone();
            }
        }
    }

    animationDone() {
        this.onResize();
    }

    start() {
        
    }

    onResizeCode() {
        
    }

    pauseCallback(isPaused) {
        this.restCountdown.paused = isPaused;
    }

    tapCallback(event) {

    }
}