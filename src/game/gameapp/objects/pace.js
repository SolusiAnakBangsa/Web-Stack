import { GameObject } from "./gameobject";

export class Pace extends GameObject {

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        this._prevPace = 0;
        this.pace = 0; // 0-100

        this.padding = 100;

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Make the container
        this.mainContainer = new PIXI.Container();

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
        this.paceSprite.position.set(pixiRef.app.screen.width - 100, 100);

        // Load the outer ring for pacesprite.
        this.outerPace = new PIXI.Sprite(pixiRef.resources.outerpace.texture);
        this.outerPace.anchor.set(0.5, 0.5);
        this.outerPace.scale.set(3, 3);
        this.outerPace.position.set(pixiRef.app.screen.width - 100, 100);
        
        // Apply the mask
        this.outerPace.mask = this.graphic;

        // Create the text for the pace.
        this.paceText = new PIXI.Text(
            String(this.pace << 0),
            {fontFamily: 'Thoughts', fontSize: 16, fill: 'black'}
        );
        this.paceText.anchor.set(0.5, 0.5);
        this.paceText.position.set(pixiRef.app.screen.width - 100, 210);
        this.paceText.scale.set(4, 4);

        this.mainContainer.addChild(this.outerPace);
        this.mainContainer.addChild(this.graphic);
        this.mainContainer.addChild(this.paceSprite);
        this.mainContainer.addChild(this.paceText);
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

    loop(delta) {
        // If the pace is changed, then run this function.
        if (this._prevPace != this.pace) {
            this._updatePace();
        }
        this._prevPace = this.pace;
    }

    onResize() {
        this.paceSprite.position.set(this.pixiRef.app.screen.width - 100, 100);
        this.outerPace.position.set(this.pixiRef.app.screen.width - 100, 100);
        this.paceText.position.set(this.pixiRef.app.screen.width - 100, 210);
        this._redrawCircleMask();
    }

}