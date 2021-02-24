import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";
// import { randomRange, randomProperty } from "./../../../script/util";

export class RunMan extends GameObject {

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        this.manHeight = 50;
        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Load all of the textures from the json file
        const runTex = [];
        
        for (let tex in pixiRef.resources.runman.spritesheet.textures) {
            runTex.push(pixiRef.resources.runman.spritesheet.textures[tex]);
        }

        // Create the animation sprite, and set all the properties.
        this.sprite = new PIXI.AnimatedSprite(runTex);
        this.sprite.gotoAndPlay(0);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(3, 3);
        this.sprite.position.set(
            this.app.screen.width/2,
            this.app.screen.height - this.manHeight
        );
        this.sprite.animationSpeed = 0.25;

        // Create a shadow filter
        this.manShadow = new ShadowShader([-0.6, -0.6], this.app.screen.height - this.manHeight - 20, 0.25);
        this.sprite.filters = [ this.manShadow ];
        

        this.app.stage.addChild(this.sprite);
    }

    onResize() {
        this.sprite.position.set(
            this.app.screen.width/2,
            this.app.screen.height - this.manHeight
        );

        this.manShadow.uniforms.floorY = this.app.screen.height - this.manHeight - 20;
    }
}