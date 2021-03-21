import { peer } from "./../../script/webrtc";
import { RunScene } from "./scenes/runscene";
import { GymScene } from "./scenes/gymscene";
import { Transitioner } from "./transitioner";
import { Countdown } from "./objects/countdown";
import { Button } from "./objects/button";

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    NONE: 0,
    JOG: 1, // Jog scene
    GYM: 2, // Gym scene
});

// How many seconds to wait before the activity starts.
const COUNTDOWNTIMER = 5;

export class GlobalController {
    
    static levelData;

    constructor(app) {
        // App object (not pixi app)
        this.appObj = app;

        // MultiObject. Object will be added to all of the scenes when transitioning.
        this.multiObject = [];

        // Title of the level
        this.title;

        // The workouts for this level.
        this.workouts = [
        {
            "freq": 30,
            "task": "Jog"
        },
        {
            "freq": 3,
            "task": "Squat"
        }, {
            "freq": 4,
            "task": "Squat"
        }, {
            "freq": 25,
            "task": "Jog"
        },
        {
            "task": "Squat",
            "freq": 15
        }
        ];

        // Index to keep track of the current workout.
        this.currentWorkoutIndex = 0;

        // State of the game.
        this.isPaused = false;

        // Begin countdown object
        this.count;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        // Do dataListener of current scene.
        this.appObj.scene.dataListener(payload);
    }

    _initializeWorkout() {
        // This will update the current workout list in this object, if the 
        // peer connection object receives anything.
        if (GlobalController.levelData !== undefined) {
            this.workouts = GlobalController.levelData["workoutList"]["tasks"];
        } else {
            console.error("Phone did not send workout list, or data is received late.");
        }

        // Looks at the first workout, and decide which scene to go.
        if (this.workouts[0].task == "Jog") {
            this.goToRun();
            // Set to float down.
            this.runScene.floatDown();
        } else {
            // FIX: This is kind of a jank fix, so maybe consider this in the future.
            this.currentWorkoutIndex = -1;
            this.goToGym();
        }

        // Add the count object to the current scene.
        this.appObj.scene.addObj(this.count);

        // Set the countdown callback and start it.
        this.count.callback = () => {
            // Set text to go, then set a timer for 1 second to delete it.
            this.count.mainContainer.text = "GO!";
            this.count.textStyle.fontSize = 200;
            // Timer to delete the count object.
            setTimeout(() => {this.appObj.scene.delObj(this.count);}, 1500);

            // When all timing is done, send a startgame to the phone.
            peer.connection.sendData({"status" : "startgame"});
        };
        this.count.start();

        // Updates the total steps has to be done.
        var totalSteps = 0;
        for (let workout of this.workouts) {
            if (workout.task == "Jog") totalSteps += workout.freq;
        }
        this.runScene.pace.targetSteps = totalSteps;
    }

    setup() {
        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));

        // Set up simple mouse clicker
        this.appObj.app.stage.on('pointerup', this._pointerUp.bind(this));
    }

    _pointerUp(event) {
        this.appObj.scene.tapCallback(event);
        // this._toggleScenes();
    }

    _toggleScenes() {
        if (this.currentWorkoutIndex >= this.workouts.length - 1) {
            this.showSummary();
            return;
        }
        // Used to toggle scenes between running and gyming.
        this.transitioner.transition(
            () => {
                // Delete every multiObject instances.
                for (let obj of this.multiObject) {
                    this.appObj.scene.delObj(obj);
                }

                // Do the function, to decide where to go.
                this._transition();

                // Add all multiObject instances to the next scene.
                for (let obj of this.multiObject) {
                    this.appObj.scene.addObj(obj);
                }
            },
            () => {
                peer.connection.sendData({"status" : "startnext"});
            },
            this.currentWorkout == Workouts.JOG ? this.transitioner._vsTransition : this.transitioner._basicTransition
        );
    }

    _transition() {
        switch (this.currentWorkout) {
            case Workouts.JOG:
                this.goToGym();
                break;
            case Workouts.GYM:
                this.goToRun();
                break;
        }
    }

    goToGym() {

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
        // TODO BRUH BRUH BRUH THE + 1
        let workoutSlice = this.workouts.slice(this.currentWorkoutIndex + 1, foundJog ? lastIndex : lastIndex + 1);

        // Change current workout index to last index.
        this.currentWorkoutIndex = lastIndex;

        // Send the workout data to the gym
        this.gymScene.startNewWorkout(workoutSlice);
        this.currentWorkout = Workouts.GYM;

        // Set scene
        this.appObj.setScene(this.gymScene);

        // Move pause button
        this.pauseButton.changePosition((sWidth) => 32, (sHeight) => 32);
    }

    goToRun() {
        this.appObj.setScene(this.runScene);
        this.currentWorkout = Workouts.JOG;

        // Update the targetSteps in the runScene thingy based on current workout index.
        var stepsUpUntil = 0;
        for (let work of this.workouts.slice(0, this.currentWorkoutIndex + 1)) {
            if (work.task == "Jog") stepsUpUntil += work.freq;
        }
        this.runScene.targetSteps = stepsUpUntil;

        // Move the pause button
        this.pauseButton.changePosition((sWidth) => sWidth - 100, (sHeight) => sHeight - 100);
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

        // Make countdown object
        this.count = new Countdown(pixiRef, COUNTDOWNTIMER);

        // Add callback to be able to transition back from gym to run
        this.gymScene.doneCallback = () => {this._toggleScenes()};
        this.runScene.doneCallback = () => {this._toggleScenes()};

        this._initializeWorkout();

        // Add the transitioner and pause to the current scene
        // IMPORTANT NOTE: You can't add objects to two pixi containers. If done, then will not display.
        this.addMultiObject(this.pauseButton);
        this.addMultiObject(this.transitioner);

        // Start the scene and trigger on resize.
        this.appObj.scene.start();
        this.appObj.scene.onResize();

        // Register unpause
        const unpause = document.getElementById("unpause");
        unpause.onclick = () => {this.pauseCallback(false)};

        // Pause the game on browser lose focus
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'hidden' && this.isPaused == false) {
                this.pauseCallback(true);
            }
        });
    }

    loop(delta) {
    }

    onResize() {
        
    }

    pauseCallback(isPaused) {
        // Set variable
        this.isPaused = isPaused;

        console.log("Paused: " + isPaused);

        // Send the pause data
        const data = {
            status: isPaused ? "pause" : "unpause"
        }
        peer.connection.sendData(data);

        // Pause the countdown
        this.count.paused = isPaused;

        // Make the overlay appear
        const pauseOverlay = document.getElementById("pause");
        if (isPaused) {
            pauseOverlay.style.zIndex = 0;
            pauseOverlay.style.opacity = 1;
        } else {
            setTimeout(() => {pauseOverlay.style.zIndex = -3;}, 0.5);
            pauseOverlay.style.opacity = 0;
        }

        // Call pause on the scenes
        this.appObj.scene.pauseCallback(isPaused);
    }

    addMultiObject(obj) {
        this.appObj.scene.addObj(obj);
        this.multiObject.push(obj);
    }

    showSummary() {
        const summary = document.getElementById("summary");
        const summBox = document.getElementById("summarybox");

        // Set up animations
        summary.style.zIndex = 0;
        summary.style.opacity = 1;

        summBox.style.transform = "scale(1, 1)";

        // Detect if there is jogging in the workout, and display graph.
        // Gets all the pace data.
        const pace = this.runScene.paceData;

        console.log(pace);

        // Draws the graph.
        var ctx = document.getElementById('pacechart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(pace.length).fill(""),
                datasets: [{
                    label: 'Pace',
                    data: pace,
                    fill: false,
                    borderColor: 'rgb(235, 129, 38)',
                    pointBorderWidth: 0,
                    borderWidth: 3,
                    radius: 0
                }]
            },
            options: {
                legend: {
                    // display: false
                },
                scales: {
                    xAxes: [{
                        display: false,
                        gridLines: {
                            display:false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 3,
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        // Gets all the workout, and insert it.
        const workoutTable = document.getElementById("workouttable");
        var column = 0; // Keep track the current table.
        const columns = 2;
        let tr;

        for (let act of this.workouts) {
            // Create a new row every column target.
            if (column == 0) {
                tr = document.createElement("tr");
                workoutTable.appendChild(tr);
            }
            // Current data
            const td = document.createElement("td");
            const num = document.createElement("span");
            num.classList.add("num");
            const task = document.createElement("span");

            num.innerText = act.freq + (act.task == "Jog" ? " steps" : "x ");
            task.innerText = act.task + " ";
            
            td.appendChild(task);
            td.appendChild(num);

            tr.appendChild(td);

            column++;

            // Cycle between the columns.
            if (column >= columns) column = 0
        }
    }
}