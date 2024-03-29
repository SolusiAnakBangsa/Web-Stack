import { peer } from "./../../script/webrtc";
import { RunScene } from "./scenes/runscene";
import { GymScene } from "./scenes/gymscene";
import { Transitioner } from "./transitioner";
import { Countdown } from "./objects/countdown";
import { Button } from "./objects/button";
import { MusicPlayer } from "./musicplayer";
import { atics } from '../../firebase/firebase';

// Static enum to store all the workouts.
let Workouts = Object.freeze({
    NONE: 0,
    JOG: 1, // Jog scene
    GYM: 2, // Gym scene
});

// How many seconds to wait before the activity starts.
const COUNTDOWNTIMER = 5;
export var levelData = {};

export class GlobalController {
    constructor(app) {
        // App object (not pixi app)
        this.appObj = app;

        // MultiObject. Object will be added to all of the scenes when transitioning.
        this.multiObject = [];

        // Title of the level
        this.title;

        // The workouts for this level.
        this.workouts = [
            // {
            //     freq: 100,
            //     task: "Jog",
            // },
            {
                freq: 3,
                task: "Push Up",
            },
            {
                freq: 4,
                task: "Squat",
            },
            {
                freq: 25,
                task: "Squat",
            },
            {
                task: "Jog",
                freq: 50,
            },
        ];

        // Index to keep track of the current workout.
        this.currentWorkoutIndex = 0;

        // State of the game.
        this.isPaused = false;

        // Begin countdown object
        this.count;

        // Whether all the workout is finished.
        this.finished = false;
    }

    _dataListener(payload) {
        // This function is used as what will be executed when the peer
        // Receives a data. This function will determine what to do with the data.

        // Do dataListener of current scene.
        this.appObj.scene.dataListener(payload);

        if (payload.status == "start") {
            atics.logEvent("workout_mid", {
                time: (new Date()).getTime(),
                payload: payload
            });
        }
    }

    _initializeWorkout() {
        // This will update the current workout list in this object, if the
        // peer connection object receives anything.
        if (levelData.data !== undefined) {
            this.workouts = levelData.data["workoutList"]["tasks"];
        } else {
            console.error(
                "Phone did not send workout list, or data is received late."
            );
        }

        // Looks at the first workout, and decide which scene to go.
        if (this.workouts[0].task == "Jog") {
            this.goToRun();
            // Set to float down.
            this.runScene.floatDown();

            // Add the count object to the current scene.
            this.appObj.scene.addObj(this.count);

            // Set the countdown callback and start it.
            this.count.callback = () => {
                // Set text to go, then set a timer for 1 second to delete it.
                this.count.mainContainer.text = "RUN!";
                this.count.textStyle.fontSize = 200;
                // Timer to delete the count object.
                setTimeout(() => {
                    this.appObj.scene.delObj(this.count);
                }, 1500);

                // When all timing is done, send a startgame to the phone.
                peer.connection.sendData({ status: "startnext" });

                // Play the start sound
                this.startSound.play();
            };

            this.count.start();
        } else {
            this.goToGym();
            // Set to float down.
            this.gymScene.floatDown();
            // Change the rest countdown to be 5 seconds.
            this.gymScene.restCountdown.setSeconds(5);
        }

        // Updates the total steps has to be done.
        var totalSteps = 0;
        for (let workout of this.workouts) {
            if (workout.task == "Jog") totalSteps += workout.freq;
        }
        this.runScene.pace.targetSteps = totalSteps;
    }

    _pointerUp(event) {
        this.appObj.scene.tapCallback(event);
        // this._toggleScenes();
    }

    _toggleScenes() {
        if (this.currentWorkoutIndex >= this.workouts.length) {
            this.showSummary();
            return;
        }

        // Play the next sound
        this.nextWorkoutSound.play();

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
            () => {},
            this.currentWorkout == Workouts.JOG
                ? this.transitioner._vsTransition
                : this.transitioner._basicTransition
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
        // Call the callback function in the scene.
        this.appObj.scene.transitionCallback();
    }

    start(pixiRef) {
        this.pixiRef = pixiRef;
        // Makes the transitioner object.
        this.transitioner = new Transitioner(pixiRef, 1);

        // Pause button to be added to all the scenes
        this.pauseButton = new Button(
            pixiRef,
            "pause",
            () => {
                this.pauseCallback(!this.isPaused);
            },
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
        this.gymScene.doneCallback = () => {
            this._toggleScenes();
        };
        this.runScene.doneCallback = () => {
            this._toggleScenes();
        };

        // Register unpause
        const unpause = document.getElementById("unpause");
        unpause.onclick = () => {
            this.pauseCallback(false);
        };

        // Pause the game on browser lose focus
        document.addEventListener("visibilitychange", () => {
            if (
                document.visibilityState === "hidden" &&
                this.isPaused == false
            ) {
                this.pauseCallback(true);
            }
        });

        // Load sounds needed
        this.nextWorkoutSound = pixiRef.resources.nextsound.sound;
        this.startSound = pixiRef.resources.startsound.sound;

        // Add some music to the player
        this.musicPlayer = new MusicPlayer();
        this.musicPlayer.addSlider(document.getElementById("volumeslider"));
        this.musicPlayer.addMusic("run", pixiRef.resources.runmusic.sound);
        this.musicPlayer.addMusic("gym", pixiRef.resources.gymmusic.sound);

        this._initializeWorkout();

        // Add the transitioner and pause to the current scene
        // IMPORTANT NOTE: You can't add objects to two pixi containers. If done, then will not display.
        this.addMultiObject(this.pauseButton);
        this.addMultiObject(this.transitioner);

        // Start the scene and trigger on resize.
        this.appObj.scene.start();
        this.appObj.scene.onResize();
    }

    setup() {
        // Register _dataListener
        peer.connection.addReceiveHandler(this._dataListener.bind(this));

        // Set up simple mouse clicker
        this.appObj.app.stage.on("pointerup", this._pointerUp.bind(this));
    }

    loop(delta) {
        this.musicPlayer.loop(delta);
    }

    onResize() {}

    goToGym() {
        // Slice this.workout object to include only the gym games from the index.
        // First, discover which index is the next jog (or the end).

        var ci = this.currentWorkoutIndex;
        const workouts = this.workouts;

        // Find the next jog, or go to the end.
        var li;
        let foundJog = false;
        for (li = ci; li < workouts.length; li++) {
            if (workouts[li].task == "Jog") {
                foundJog = true;
                break;
            }
        }

        const workoutSlice = workouts.slice(ci, foundJog ? li : li + 1);

        this.currentWorkoutIndex = li;

        // Send the workout data to the gym
        this.gymScene.startNewWorkout(workoutSlice);
        this.currentWorkout = Workouts.GYM;

        // Set scene
        this.appObj.setScene(this.gymScene);

        // Move pause button
        this.pauseButton.changePosition(
            () => 32,
            () => 32
        );

        // Play gym music
        this.musicPlayer.play("gym", true);
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
        this.pauseButton.changePosition(
            (sWidth) => sWidth - 100,
            (sHeight) => sHeight - 100
        );

        // Increase the workout index.
        this.currentWorkoutIndex++;

        // Play the music
        this.musicPlayer.play("run", true);
    }

    pauseCallback(isPaused) {
        // If the game is already finished, don't pause.
        if (this.finished) return;

        // Set variable
        this.isPaused = isPaused;

        // Send the pause data
        const data = {
            status: isPaused ? "pause" : "unpause",
        };
        peer.connection.sendData(data);

        // Pause the countdown
        this.count.paused = isPaused;

        // Make the overlay appear
        const pauseOverlay = document.getElementById("pause");
        if (isPaused) {
            pauseOverlay.style.zIndex = 0;
            pauseOverlay.style.opacity = 1;
        } else {
            setTimeout(() => {
                pauseOverlay.style.zIndex = -3;
            }, 0.5);
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
        // Set tag
        this.finished = true;

        const summary = document.getElementById("summary");
        const summBox = document.getElementById("summarybox");

        // Set up animations
        summary.style.zIndex = 0;
        summary.style.opacity = 1;

        summBox.style.transform = "scale(1, 1)";

        // Detect if there is jogging in the workout, and display graph.
        // Gets all the pace data.
        const pace = this.runScene.paceData;

        // Draws the graph.
        var ctx = document.getElementById("pacechart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: Array(pace.length).fill(""),
                datasets: [
                    {
                        label: "Pace",
                        data: pace,
                        fill: false,
                        borderColor: "rgb(235, 129, 38)",
                        pointBorderWidth: 0,
                        borderWidth: 3,
                        radius: 0,
                    },
                ],
            },
            options: {
                legend: {
                    // display: false
                },
                scales: {
                    xAxes: [
                        {
                            display: false,
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 3,
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            },
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
            if (column >= columns) column = 0;
        }
    }
}
