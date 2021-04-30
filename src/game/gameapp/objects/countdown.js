import { GameObject } from "./gameobject";

export class Countdown extends GameObject {
    constructor(pixiRef, seconds = null, callback = null) {
        super(pixiRef);

        this.counter = seconds + 0.999;
        this.textStyle = new PIXI.TextStyle({
            dropShadow: true,
            dropShadowColor: "#f58405",
            fill: "white",
            fontFamily: "Arial Black",
            fontStyle: "italic",
            fontVariant: "small-caps",
            fontWeight: "bold",
            padding: 64,
            fontSize: 140,
            strokeThickness: 5,
        });
        this.mainContainer = new PIXI.Text(
            String(seconds << 0),
            this.textStyle
        );
        this.callback = callback;
        this.started = false;

        // Whether the countdown is paused.
        this.paused = false;

        // Default position of the countdown.
        this.xPos = (scr) => scr.width / 2;
        this.yPos = (scr) => scr.height / 2;

        this.setup(pixiRef);
    }

    start() {
        this.started = true;
    }

    setup() {
        this.mainContainer.anchor.set(0.5, 0.5);

        this.onResize();
    }

    loop(delta) {
        if (this.started && this.counter >= 1 && !this.paused) {
            this.counter -= delta / 1000;
            this.mainContainer.text = String(this.counter << 0);

            // If limit have been reached
            if (this.counter < 1) {
                this.started = false;
                if (this.callback != null) this.callback();
            }
        }
    }

    onResize() {
        const screen = this.app.screen;
        this.mainContainer.position.set(this.xPos(screen), this.yPos(screen));
    }

    setSeconds(seconds) {
        this.counter = seconds + 0.999;
    }

    setCallback(callback) {
        this.callback = callback;
    }
}
