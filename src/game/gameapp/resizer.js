import { getHeight, getWidth } from "./../../script/util";

export class Resizer {

    constructor() {
        // object is the object browser will call on the resize event (window.onresize)
        // This variable is to store all the functions that will be run after
        // A window resize event.
        this.lambdas = [];

        // Counter to count seconds
        this.counter = 0;

        // Interval to check updates (milliseconds).
        this.interval = 200;

        // Keep track browser window size
        this.width = getWidth();
        this.height = getHeight();

        // The onresize thing does not work often. So, a system manually develop.
        // window.onresize = this.execute.bind(this);
    }

    add(callback) {
        // Add the function to the function lists
        this.lambdas.push(callback);
    }

    execute() {
        // Execution for the window
        for (let l of this.lambdas) {
            l();
        }
    }

    loop(delta) {
        // This needs to be placed in the main game loop.
        this.counter += delta;

        // Interval to check any window size updates.
        if (this.counter > this.interval) {
            this.counter = 0;

            const width = getWidth();
            const height = getHeight();

            // If the window is resized, then do the codes.
            if (width != this.width || height != this.height) {
                this.execute();
            }

            this.width = width;
            this.height = height;
        }
    }
}