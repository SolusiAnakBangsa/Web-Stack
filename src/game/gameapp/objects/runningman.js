import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";
import { propertyLength } from "./../../../script/util";
// import { randomRange, randomProperty } from "./../../../script/util";

export class RunMan extends GameObject {

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        this._state = 0; // State of the running guy. 0 = idle 1 = run.

        this.manHeight = 50; // Position of the guy in the screen, relative to the bottom of the screen.
        this.speed = 0; // in pixel/second.

        // Textures
        this.runTex = [];
        this.idleTex = [];

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Load all of the textures from the json file        
        // The rule is, the first and second index in the spritesheet is the idle animation.
        const frames = Object.keys(pixiRef.resources.runman.spritesheet.textures);
        for (var i = 0; i < frames.length; i++) {
            if (i < 2) {
                this.idleTex.push(pixiRef.resources.runman.spritesheet.textures[frames[i]]);
            } else {
                this.runTex.push(pixiRef.resources.runman.spritesheet.textures[frames[i]]);
            }
        }

        // Create the animation sprite, and set all the properties.
        this.sprite = new PIXI.AnimatedSprite(this.idleTex);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(3.5, 3.5);
        
        // Animation
        this.sprite.gotoAndPlay(0);
        this.sprite.animationSpeed = 0.01;

        // Create a shadow filter
        this.manShadow = new ShadowShader([-0.6, -0.6], (this.sprite.y - 15) << 0, 0.25);
        this.sprite.filters = [ this.manShadow ];
        
        this.mainContainer = new PIXI.Container();
        this.mainContainer.addChild(this.sprite);

        // Call onresize
        this.onResize();
    }

    loop() {
        // Check guy speed and state here, and change the texture and animation speed accordingly
        if (this.speed == 0 && this._state == 1) {
            // Do texture change and animation here.
            // If the sprite is stopped then, do this.
            this.sprite.textures = this.idleTex;
            this.sprite.gotoAndPlay(0);
            this.sprite.animationSpeed = 0.01;
            this._state = 0;

        } else if (this.speed > 0 && this._state == 0) {

            this.sprite.textures = this.runTex;
            this.sprite.gotoAndPlay(0);
            this._state = 1;
        }
        if (this.speed != 0) {
            this.sprite.animationSpeed = this.speed;
        }

        // Move shadow
        this.manShadow.uniforms.floorY = (this.mainContainer.y + this.sprite.y - 15) << 0;
    }

    onResize() {
        this.sprite.position.set(
            this.app.screen.width/2,
            this.app.screen.height - this.manHeight
        );
    }
}