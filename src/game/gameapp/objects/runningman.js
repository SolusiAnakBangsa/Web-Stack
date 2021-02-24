import { GameObject } from "./gameobject";
import { randomRange, randomProperty } from "./../../../script/util";

export class RunMan extends GameObject {

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        this.manHeight = 50;
        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        const runTex = [];
        
        for (let tex in pixiRef.resources.runman.spritesheet.textures) {
            runTex.push(pixiRef.resources.runman.spritesheet.textures[tex]);
        }

        this.sprite = new PIXI.AnimatedSprite(runTex);
        this.sprite.gotoAndPlay(0);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(3, 3);
        this.sprite.position.set(
            this.app.screen.width/2,
            this.app.screen.height - this.manHeight
        );
        this.sprite.animationSpeed = 0.25;
        this.app.stage.addChild(this.sprite);
    }

    onResize() {
        this.sprite.position.set(
            this.app.screen.width/2,
            this.app.screen.height - this.manHeight
        );
    }
}