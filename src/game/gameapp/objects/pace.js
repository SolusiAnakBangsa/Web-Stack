import { GameObject } from "./gameobject";
import { clamp, padZero, randomArray, randomRange } from "./../../../script/util";

// Length of the progress bar.
const PROGRESSXOFFSET = 10 * 3;
const PROGRESSYOFFSET = 4 * 3;
const PROGRESSLENGTH = 121 * 3;
const PROGRESSHEIGHT = 3 * 3;

const FACTWIDTH = 600;
const FACTHEIGHT = 200;

const FACTDURATION = 10000;
const FACTSPAWNRANGE = [20000, 50000];

const WORKOUTFUNFACTS = [
    "Exercising is important in daily life! According to Dr. Edward from Mayo Clinic, it's important to keep at least 30 minutes of moderate physical activities everyday!", // https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/exercise/faq-20057916
    "Reducing sitting time is important! Sitting too much for long period of times can impact your health negatively. Try to stand up and move once in every while. Don't forget to check your sitting posture too while you're at it!",
    "Not only beneficial for you physical health, many mental health benefits can be earned through an exercise. It relaxes your mind, and can help you to think more clearly after!",
    "A good sweaty workout burns fat, and increases your muscle fitness. It's as simple as that!",
    "Exercising regularly makes you able to do daily physical activities with ease. It also increases your immune system so that you get sick less!",
    "Working out leads to good posture and body, boosting your self-confidence by much!",
]

export class Pace extends GameObject {
    /*
    Originally for pace. Now, this object is for running gui
    */

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        this._prevPace = 0;
        this.pace = 0; // 0-100
        this.targetSteps = 5000;
        this.steps = 0;

        this.padding = 100;

        // Instruction methods
        this.displayFact = false;
        this.progressFact = 0;
        this.instructionLerp = (x) => x*x*x*x*x;

        const ANIMATIONLENGTH = 1000; // ms
        this.lerpPeriod = (1000/ANIMATIONLENGTH)/60;
        this.factCounter = 0;

        this.factTimer = 0;
        this.factTimerBound = randomRange(FACTSPAWNRANGE[0], FACTSPAWNRANGE[1]);

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Make the container
        this.mainContainer = new PIXI.Container();

        // **************
        // Pace sprite loading
        // Load all the texture.
        const texture = [];
        for (let tex in pixiRef.resources.pacesprite.spritesheet.textures) {
            texture.push(pixiRef.resources.pacesprite.spritesheet.textures[tex]);
        }

        this.graphic = new PIXI.Graphics();

        // Load the pacesprite with all the frames.
        this.paceSprite = new PIXI.AnimatedSprite(texture);
        this.paceSprite.scale.set(3, 3);
        this.paceSprite.anchor.set(0.5, 0.5);

        // Load the outer ring for pacesprite.
        this.outerPace = new PIXI.Sprite(pixiRef.resources.outerpace.texture);
        this.outerPace.anchor.set(0.5, 0.5);
        this.outerPace.scale.set(3, 3);
        
        // Apply the mask
        this.outerPace.mask = this.graphic;

        // Create the text for the pace.
        this.paceText = new PIXI.Text(
            String(this.pace << 0),
            {fontFamily: 'Thoughts', fontSize: 16, fill: 'black'}
        );
        this.paceText.anchor.set(0.5, 0.5);
        this.paceText.scale.set(4, 4);
        // ***************

        // ***************
        // Run progress bar.
        this.runProgress = new PIXI.Sprite(pixiRef.resources.runprogress.texture);
        // this.runProgress.anchor.set(0.5, 0.5);
        this.runProgress.scale.set(3, 3);
        this.runProgress.position.set(
            32,
            32
        );

        this.runProgressBar = new PIXI.Graphics();
        this._redrawProgressBar();
        // ***************

        // ***************
        // Steps number
        this.stepsCounterStyle = new PIXI.TextStyle({
            fontFamily: "\"Orbitron\", \"Lucida Console\", Monaco, monospace",
            fontSize: 36,
            fontStyle: "italic",
            fontWeight: 500,
            padding: 32
        });
        this.stepsCounter = new PIXI.Text("00000", this.stepsCounterStyle);
        this.stepsCounter.position.set(32, 84);
        // ***************

        // ***************
        // Fun fact zone
        // TODO: This can defnitely made into a class.
        this.frontContainer = new PIXI.Container();

        this.factContainer = new PIXI.Container();

        // Spawn stuff to the container.
        // Make background graphics
        const backGraphics = new PIXI.Graphics();
        backGraphics.beginFill(0xFFFFFF);
        backGraphics.drawRoundedRect(
            -FACTWIDTH/2,
            -FACTHEIGHT/2,
            FACTWIDTH,
            FACTHEIGHT,
            30
        );
        backGraphics.endFill();
        backGraphics.alpha = 0.65;

        // Draw guy portrait
        this.factGuy = new PIXI.Sprite(pixiRef.resources.factguy.texture);
        this.factGuy.scale.set(3);
        this.factGuy.anchor.set(0.5);
        this.factGuy.position.set(-FACTWIDTH/2 + 65, 0);

        // Draw title text
        const titleText = new PIXI.Text("Armogus says...", new PIXI.TextStyle({
            fontSize: 24,
            fontStyle: "italic",
            fontWeight: "bold",
            padding: 8,
        }));
        titleText.position.set(-FACTWIDTH/2 + 130, -FACTHEIGHT/2 + 20);

        // Draw the actual text contents.
        this.factText = new PIXI.Text(WORKOUTFUNFACTS[0], new PIXI.TextStyle({
            fontSize: 20,
            padding: 8,
            wordWrap: true,
            wordWrapWidth: FACTWIDTH*3/4
        }));
        this.factText.position.set(-FACTWIDTH/2 + 130, -FACTHEIGHT/2 + 60);

        this.factContainer.addChild(backGraphics);
        this.factContainer.addChild(this.factGuy);
        this.factContainer.addChild(titleText);
        this.factContainer.addChild(this.factText);
        // ***************

        this.mainContainer.addChild(this.stepsCounter);

        this.mainContainer.addChild(this.runProgress);
        this.mainContainer.addChild(this.runProgressBar);

        this.mainContainer.addChild(this.outerPace);
        this.mainContainer.addChild(this.graphic);
        this.mainContainer.addChild(this.paceSprite);
        this.mainContainer.addChild(this.paceText);
        this.mainContainer.addChild(this.frontContainer);

        // Call onresize
        this.onResize();
    }

    _redrawFactLoop(delta) {
        // Logic to redraw the fact UI
        // The third nested if statement here refers to the logic to stop rendering the container once gone.
        let redrawInstruction = false;

        // Increase fact timer
        this.factTimer += delta;
        // Display fact when timer is already met.
        if (this.factTimer >= this.factTimerBound) {
            this._displayFact();
        }

        if (this.displayFact) {

            // Timer for the fact showing
            // Add fact counter
            this.factCounter += delta;

            // Make the fact disappear
            if (this.factCounter >= FACTDURATION) {
                this.displayFact = false;
            }

            if (this.progressFact < 1) {
                if (this.progressFact >= 0) {
                    this.frontContainer.addChild(this.factContainer);
                }
                this.progressFact += this.lerpPeriod;
                redrawInstruction = true;
            }
        } else {
            if (this.progressFact > 0) {
                this.progressFact -= this.lerpPeriod;
                redrawInstruction = true;
                if (this.progressFact <= 0) {
                    this.frontContainer.removeChild(this.factContainer);
                }
            }
        }
        if (redrawInstruction) this._redrawInstruction();
    }

    _redrawInstruction() {
        const lerp = this.instructionLerp(this.progressFact);

        this.factContainer.scale.set(lerp, 1);
    }

    _displayFact() {
        this.factCounter = 0;
        this.displayFact = true;
        this.factText.text = randomArray(WORKOUTFUNFACTS);

        // Reset timer
        this.factTimer = 0;
        this.factTimerBound = randomRange(FACTSPAWNRANGE[0], FACTSPAWNRANGE[1]);
    }

    _updatePace() {
        // This method is run when the pace is changed.
        if (this.pace < 25) {
            this.paceSprite.gotoAndStop(0);
        } else if (this.pace < 50) {
            this.paceSprite.gotoAndStop(1);
        } else if (this.pace < 75) {
            this.paceSprite.gotoAndStop(2);
        } else {
            this.paceSprite.gotoAndStop(3);
        }

        // Update text
        this.paceText.text = String(this.pace << 0);

        // Here, we remake the graphic that masks the outer ring.
        this._redrawCircleMask();
    }

    _redrawCircleMask() {
        // Center coordinates
        const cx = this.pixiRef.app.screen.width - 100;
        const cy = 100
        const r = this.outerPace.width/2; // Radius of the circle.

        // Radius from the circle to make a 90 degree triangle,
        // so that the nearest point from the triangle to the circle center is still outside of the circle.
        const rpm = r * Math.SQRT2;

        // Clear the graphic
        this.graphic.clear();

        // Colors
        this.graphic.lineStyle(2, 0xffffff, 1);
        this.graphic.beginFill(0xffffff, 1);

        // Make the actual circle mask.
        this.graphic.moveTo(cx, cy); // Center of the circle
        this.graphic.lineTo(cx, cy - rpm); // Top of the circle
        
        // Here, we calculate the "Fullness of the pace, then convert it to a circle."
        // In this nested if statements, we will make the circle in quarters.
        if (this.pace >= 25) {
            // If pace is more than 25, then next line is at the 90dgr.
            this.graphic.lineTo(cx + rpm, cy); // Right of the circle
            if (this.pace >= 50) {
                this.graphic.lineTo(cx, cy + rpm); // Bottom of the circle
                if (this.pace >= 75) {
                    this.graphic.lineTo(cx - rpm, cy); // Left of circle.
                    if (this.pace >= 100) {
                        this.graphic.lineTo(cx, cy - rpm);// Full circle.
                    }
                }
            }
        }

        // Define the degrees based on the pace.
        const rad = Math.PI * this.pace/50;

        // Here, draw the line with precision.
        this.graphic.lineTo(
            cx + Math.sin(rad) * rpm,
            cy - Math.cos(rad) * rpm
        ); // Full circle.
        
        this.graphic.endFill();
    }

    _redrawProgressBar() {
        this.runProgressBar.clear();
        this.runProgressBar.beginFill(0xf9ad3f);
        const pX = this.runProgress.x;
        const pY = this.runProgress.y;
    
        const progressXPos = clamp(this.steps/this.targetSteps * PROGRESSLENGTH, 0, PROGRESSLENGTH);

        // Draws the progress bar.
        this.runProgressBar.drawRect(
            pX + PROGRESSXOFFSET,
            pY + PROGRESSYOFFSET,
            progressXPos,
            PROGRESSHEIGHT
        );
        
        // Draws the arrow
        const progressX = pX + PROGRESSXOFFSET + progressXPos;
        const progressY = pY + PROGRESSYOFFSET + 20;

        this.runProgressBar.lineStyle(5, 0xF85A12, 1);
        this.runProgressBar.endFill();

        this.runProgressBar.moveTo(
            progressX - 7,
            progressY + 6
        );
        this.runProgressBar.lineTo(
            progressX,
            progressY
        );
        this.runProgressBar.lineTo(
            progressX + 7,
            progressY + 6
        );

        this.runProgressBar.lineStyle(0);
    }

    setSteps(step) {
        this.steps = step;

        this.stepsCounter.text = padZero(step, 5);

        // Redraw run bar
        this._redrawProgressBar();
    }

    loop(delta) {
        // If the pace is changed, then run this function.
        if (this._prevPace != this.pace) {
            this._updatePace();
        }
        this._prevPace = this.pace;

        // Redraw fact loop here.
        this._redrawFactLoop(delta);
    }

    onResize() {

        const width = this.pixiRef.app.screen.width;

        this.paceSprite.position.set(width - 100, 100);
        this.outerPace.position.set(width - 100, 100);
        this.paceText.position.set(width - 100, 210);
        this._redrawCircleMask();
        this.factContainer.position.set(width/2, 150);
    }

}