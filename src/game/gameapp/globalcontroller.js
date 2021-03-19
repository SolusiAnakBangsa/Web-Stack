import { peer } from "./../../script/webrtc";
import { RunScene } from "./scenes/runscene";
import { GymScene } from "./scenes/gymscene";
import { Transitioner } from "./transitioner";
import { Button } from "./objects/button";

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    NONE: 0,
    JOG: 1, // Jog scene
    GYM: 2, // Gym scene
});

export class GlobalController {

    constructor(app) {
        // App object (not pixi app)
        this.appObj = app;

        // MultiObject. Object will be added to all of the scenes when transitioning.
        this.multiObject = [];

        // Title of the level
        this.title;

        // The workouts for this level.
        this.workouts = [{
            "freq": 400,
            "task": "Jog"
        }, {
            "freq": 3,
            "task": "Jumping Jack"
        }, {
            "task": "Squat",
            "freq": 4
        }, {
            "freq": 4,
            "task": "Knee Push Up"
        }, {
            "freq": 200,
            "task": "Jog"
        }, {
            "task": "Squat",
            "freq": 15
        }
        ];

        // Index to keep track of the current workout.
        this.currentWorkoutIndex = 0;

        this.isPaused = false;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        console.log(payload);

        // Receive whole workout data, and sets the variables.
        if ("workoutList" in payload) {
            // FIX: Don't let game start before receiving this.
            this.title = payload["title"];
            this.workouts = payload["tasks"];
            return;
        }

        // Do dataListener of current scene.
        this.appObj.scene.dataListener(payload);
    }

    setup() {
        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));

        // Set up simple mouse clicker
        this.appObj.app.stage.on('pointerup', this._pointerUp.bind(this));
    }

    _pointerUp(event) {
        this.appObj.scene.tapCallback(event);

        this._toggleScenes();
    }

    _toggleScenes() {
        // Used to toggle scenes between running and gyming.
        this.transitioner.transition(
            () => {
                // Delete every multiObject instances.
                for (let obj of this.multiObject) {
                    this.appObj.scene.delObj(obj);
                }

                switch (this.currentWorkout) {
                    case Workouts.JOG:
                        // Slice this.workout object to include only the gym games from the index.
                        // First, discover which index is the next jog (or the end).
                        let lastIndex;
                        let foundJog = false;
                        for (lastIndex = this.currentWorkoutIndex + 1; lastIndex < this.workouts.length; lastIndex++) {
                            if (this.workouts[lastIndex].task == "Jog") {
                                foundJog = true;
                                break;
                            }
                        }

                        // Slice it.
                        // If the next jog exercise is not found, then send Everything up until the last point.
                        let workoutSlice = this.workouts.slice(this.currentWorkoutIndex + 1, foundJog ? lastIndex : lastIndex + 1);

                        // Change current workout index to last index.
                        this.currentWorkoutIndex = lastIndex;
                        this.goToGym(workoutSlice);
                        break;
                    case Workouts.GYM:
                        this.goToRun();
                        break;
                }

                // Add all multiObject instances to the next scene.
                for (let obj of this.multiObject) {
                    this.appObj.scene.addObj(obj);
                }
            },
            undefined,
            this.currentWorkout == Workouts.JOG ? this.transitioner._vsTransition : this.transitioner._basicTransition
        );
    }

    goToGym(workouts) {
        // Send the workout data to the gym
        this.gymScene.startNewWorkout(workouts);
        this.currentWorkout = Workouts.GYM;

        // Set scene
        this.appObj.setScene(this.gymScene);

        // Move pause button
        this.pauseButton.changePosition((sWidth) => 32, (sHeight) => 32);
    }

    goToRun() {
        this.appObj.setScene(this.runScene);
        this.currentWorkout = Workouts.JOG;

        // Move the pause button
        this.pauseButton.changePosition((sWidth) => sWidth - 100, (sHeight) => 256);
    }

    start(pixiRef) {
        this.pixiRef = pixiRef;
        // Makes the transitioner object.
        this.transitioner = new Transitioner(pixiRef, 1);

        // Pause button to be added to all the scenes
        this.pauseButton = new Button(
            pixiRef,
            "pause",
            () => {this.pauseCallback(!this.isPaused)},
            null,
            null,
            64,
            0x2371d7
        );

        // When global controller starts, set the first scene to be the running scene.
        this.runScene = new RunScene(this.pixiRef, this);
        this.gymScene = new GymScene(this.pixiRef, this);

        // Add callback to be able to transition back from gym to run
        this.gymScene.doneCallback = () => {this._toggleScenes()};

        // this.goToGym(workouts);

        // Set first scene to be running
        // TODO: Might wanna change this later.
        this.goToRun();

        // Add the transitioner and pause to the current scene
        // IMPORTANT NOTE: You can't add objects to two pixi containers. If done, then will not display.
        this.addMultiObject(this.pauseButton);
        this.addMultiObject(this.transitioner);

        // Start the scene and trigger on resize.
        this.appObj.scene.start();
        this.appObj.scene.onResize();
    }

    loop(delta) {
    }

    onResize() {
        
    }

    pauseCallback(isPaused) {
        // Set variable
        this.isPaused = isPaused;

        console.log("Paused: " + isPaused);

        // Call pause on the scenes
        this.appObj.scene.pauseCallback(isPaused);
    }

    addMultiObject(obj) {
        this.appObj.scene.addObj(obj);
        this.multiObject.push(obj);
    }
}