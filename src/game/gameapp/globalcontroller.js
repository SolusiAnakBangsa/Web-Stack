import { peer } from "./../../script/webrtc";
import { RunScene } from "./scenes/runscene";
import { GymScene } from "./scenes/gymscene";
import { Transitioner } from "./transitioner";

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    NONE: 0,
    JOG: 1, // Jog scene
    GYM: 2, // Gym scene
});

const workouts = [
    {task: "Push Up", freq: 12},
    {task: "Sit Up", freq: 5},
    {task: "Jumping Jack", freq: 6},
    {task: "Reclined Rhomboid Squeeze", freq: 6},
];

export class GlobalController {

    constructor(app) {
        // App object (not pixi app)
        this.appObj = app;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        console.log(payload);

        // Do dataListener of current scene.
        this.appObj.scene.dataListener(payload);
    }

    setup() {
        this.currentWorkout = Workouts.JOG;

        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));

        // Set up simple mouse clicker
        this.appObj.app.stage.on('pointerup', this._pointerUp.bind(this));
    }

    _pointerUp(event) {
        this._toggleScenes();
    }

    _toggleScenes() {
        // Used to toggle scenes between running and gyming.
        this.transitioner.transition(
            () => {
                // Remove the transitioner from current scene
                this.appObj.scene.delObj(this.transitioner);

                switch (this.currentWorkout) {
                    case Workouts.JOG:
                        this.goToGym(workouts);
                        break;
                    case Workouts.GYM:
                        this.goToRun();
                        break;
                }

                // Add the transitioner to the next scene.
                this.appObj.scene.addObj(this.transitioner);
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
    }

    goToRun() {
        this.appObj.setScene(this.runScene);
        this.currentWorkout = Workouts.JOG;
    }

    start(pixiRef) {
        this.pixiRef = pixiRef;
        // Makes the transitioner object.
        this.transitioner = new Transitioner(pixiRef, 1);

        // When global controller starts, set the first scene to be the running scene.
        this.runScene = new RunScene(this.pixiRef, this);
        this.gymScene = new GymScene(this.pixiRef, this);

        // Add callback to be able to transition back from gym to run
        this.gymScene.doneCallback = () => {this._toggleScenes()};

        this.appObj.setScene(this.runScene);

        // Add the transitioner to the current scene
        // IMPORTANT NOTE: You can't add objects to two pixi containers. If done, then will not display.
        this.appObj.scene.addObj(this.transitioner);

        // Start the scene and trigger on resize.
        this.appObj.scene.start();
        this.appObj.scene.onResize();

        this.currentWorkout = Workouts.NONE;
    }

    loop(delta) {
    }

    onResize() {
        
    }
}