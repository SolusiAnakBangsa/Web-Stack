import { GameObject } from "./gameobject";

const BUTTONRATIO = 0.8;

export class Button extends GameObject {

    constructor(pixiRef, icon, clickCallback, xFunction, yFunction, buttonSize, color) {
        super(pixiRef);

        this.xFunction = xFunction;
        this.yFunction = yFunction;

        this.buttonSize = buttonSize;

        // Make the button graphics.
        this.buttonGraphic = new PIXI.Graphics();
        this.buttonGraphic.beginFill(color);
        this.buttonGraphic.drawRoundedRect(0, 0, buttonSize, buttonSize, 16);
        this.buttonGraphic.endFill();

        this.setCallback(clickCallback);

        // Spawn the icon
        this.iconStyle = new PIXI.TextStyle({
            fill: "white",
            fontFamily: "Material Icons",
            fontSize: buttonSize * BUTTONRATIO
        });

        this.yOffset = buttonSize * 0.16 * BUTTONRATIO; // Weird google icon offset.

        this.iconText = new PIXI.Text(icon, this.iconStyle);
        this.iconText.anchor.set(0.5, 0.5);

        this.setup(pixiRef);
    }

    start() {
    }

    setup(pixiRef) {

        // Makes the button interactive
        this.mainContainer.interactive = true;
        this.mainContainer.buttonMode = true;
        
        this.mainContainer.addChild(this.buttonGraphic);
        this.mainContainer.addChild(this.iconText);

        this.onResize();
    }

    loop(delta) {
    }

    onResize() {
        this.iconText.position.set(
            this.buttonSize/2,
            this.buttonSize/2 + this.yOffset
        );
    }

    setCallback(pressedCallback) {
        if (pressedCallback !== undefined && pressedCallback !== null)
            this.mainContainer.on("pointerdown", pressedCallback);
    }
}