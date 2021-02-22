import { GameObject } from "./gameobject";
import { randomRange } from "./../../../script/util";

export class Sky extends GameObject {

    constructor(pixiRef, drawTo) {
        super(pixiRef, drawTo);

        /*
            Setting the sprite2d projection to blank really messes up
            with all the scaling in the game. Therefore, magic number may be seen.
        */

        // Projection point for the sky
        this.projPoint = new PIXI.Point(0, this.app.screen.height/3);
        this.factor = 0.875;

        this.speedRange = [0.5, 4];

        // This is to store all the cloud sprite textures.
        this.cloudsTex = pixiRef.resources.cloud.spritesheet;
        this.cloudScale = [130, 30];
        this.cloudYRange = [-20, 500];
        this.cloudSpawnRange = [3000, 5000]; // Milliseconds

        // Counter for the cloud spawn mechanism.
        this.counterBound = randomRange(...this.cloudSpawnRange);
        this.counter = 0;

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Skybox container
        this.skyContainer = new PIXI.projection.Container2d();
        this.skyContainer.position.set(this.app.screen.width/2, 0);

        // Create the sprite to place the clouds for the projection.
        this.skyProj = new PIXI.projection.Sprite2d(PIXI.Texture.BLANK);
        this.skyProj.anchor.set(0.5, 0);

        this.skyContainer.addChild(this.skyProj);
        this.app.stage.addChild(this.skyContainer);
    }

    makeCloud() {

        // Will generate a cloud in a random location on the left bound of the screen.
        let cloud = new PIXI.projection.Sprite2d(this.cloudsTex.textures["3"]);

        // Randomize the y axis
        cloud.y = randomRange(...this.cloudYRange);
        cloud.x = -this.app.screen.width - cloud.y*1.5;
        cloud.vx = randomRange(...this.speedRange, false);

        cloud.anchor.set(0.5, 0.5);
        cloud.scale.set(...this.cloudScale);

        return cloud;
    }

    loop(delta) {
        this.skyContainer.proj.setAxisY(this.projPoint, this.factor);
        
        // Move all the clouds
        for (let cloud of this.skyProj.children) {
            cloud.x += cloud.vx;
        }

        // Spawn the clouds periodically.
        this.counter += delta;

        // If the counter finally comes to the bound, spawn the clouds
        if (this.counter > this.counterBound) {
            // Spawn a cloud
            let cloud = this.makeCloud();
            this.skyProj.addChild(cloud);
            
            // Detects and deletes cloud outside the screen
            for (let cl of this.skyProj.children) {
                if (cl.x > (this.app.screen.width - cl.y*1.5)) {
                    this.skyProj.removeChild(cl);
                }
            }

            // Reset counter bound
            this.counter = 0;
            this.counterBound = randomRange(...this.cloudSpawnRange);
        }
    }

    onResize() {
        // Reconfigure values
        this.projPoint = new PIXI.Point(0, this.app.screen.height/3);
        this.skyContainer.position.set(this.app.screen.width/2, 0);
        this.cloudXBound = this.app.screen.width - cloud.y*1.5;
    }
}