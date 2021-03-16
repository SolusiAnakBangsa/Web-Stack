import { Scene } from "./../scene";
import { FightFloor } from "./../objects/fightfloor";
import { FightMan } from "./../objects/fightman";
import { FightUI } from "./../objects/fightui";

export class GymScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);

        // The workouts that will be done in this stage
        this.workouts; // {task: "", freq: 0}

        // The reps for the workout. Used for the workout progress bar
        this.currentReps = 0;

        // Current Workout index
        this.workoutIndex;
    }

    startNewWorkout(workouts) {
        // Set a new workout routine that will be done in this stage.
        this.workouts = workouts;
        this.workoutIndex = 2;
        
        this.nextWorkout();
    }

    nextWorkout() {
        // Skips to the next workout, and updates all the value.
        // If there is no next workout, destroys the enemy.

        if (this.workoutIndex < this.workouts.length) {

            this.workoutIndex++;

            if (this.workoutIndex < this.workouts.length - 1) {
                this.fightUI.workoutCounter.text = this.workouts[this.workoutIndex].freq;
                this.fightUI.workoutText.text = this.workouts[this.workoutIndex].task;
                this.fightUI.workoutP = 0;
                this.fightUI._redrawWorkoutBar();
            } else {
                // When all the workouts is done.
                this.fightUI.workoutCounter.text = "✅";
                this.fightUI.workoutText.text = "VICTORY!";
                this.fightUI.workoutP = 1;
                this.fightUI._redrawWorkoutBar();
            }

            this.fightUI.enemyHealthP = (this.workouts.length - this.workoutIndex)/this.workouts.length;
            this.fightUI._redrawEnemyHealth();
        }
    }

    dataListener(payload) {
        // Data listener. Will do events inside here when a new data has been received from phone.
        // TODO
    }

    setup(pixiRef) {
        this.fightFloor = new FightFloor(pixiRef);
        this.fightMan = new FightMan(pixiRef);
        this.fightUI = new FightUI(pixiRef);

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