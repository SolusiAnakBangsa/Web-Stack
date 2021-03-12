import { GameObject } from "./gameobject";
import { randomRange, randomFour, randomProperty } from "./../../../script/util";

const XPROJECTIONOFFSET = -200;

export class FightFloor extends GameObject {

    constructor(pixiRef, drawTo) {
        // Object to render the floor in the game.
        super(pixiRef, drawTo);

        this.atmosphericAlpha = 0.2;
        this.initialDecor = 40; // Number of initial decor objects

        this.horizonY = () => pixiRef.app.screen.height/2.4;

        // Projection properties
        this.projPoint = new PIXI.Point(0, -this.horizonY());
        this.factor = 0.875;

        // Displace correction useful so that the displacement map is offset above the horizon line.
        this.displace_y_correction = -150;
        this.yScale = 1.1; // YScale is used to scale the height of the floor projection tile.
        this.yOffset = 50; // Offsets the floor.

        // Textures from a spritesheet for the floor decorations
        this.floorDecorTex = pixiRef.resources.floorDecor.spritesheet;
        this.floorDecorYSpawn = this.app.screen.height + this.yOffset - this.horizonY() * this.yScale;

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Container for floor and background
        this.wholeContainer = new PIXI.Container();

        // Floor container
        this.floorContainer = new PIXI.projection.Container2d();
        this.floorContainer.y += this.yOffset;

        // Pixel scale.
        const scale = 4;

        // Loads the floor texture and positions it in the bottom center of the screen.
        // Rotate texture 180 degrees
        pixiRef.resources.landsurface.texture.rotate = 4;
        this.floor = new PIXI.projection.TilingSprite2d(
                pixiRef.resources.landsurface.texture,
                pixiRef.app.screen.width,
                this.horizonY() * this.yScale,
            );
        this.floor.anchor.set(0.5, 1.0);
        this.floor.tileScale.set(scale, scale);
        
        // Here, lets create a displacement map, to distort the horizon, as if we are walking on a sphere.
        this.displacementSprite = PIXI.Sprite.from(pixiRef.resources.landdisplacement.texture);
        this.displacementSprite.anchor.set(0.5, 0);
        
        // Create the filter from the displacement sprite. Then, apply the filter to the floor
        this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
        this.displacementFilter.padding = 150; // Giving extra space for the filter to work.
        this.displacementFilter.scale.set(0, 60); // This represents how much the maximum horizon distortion map in pixels.

        this.floorContainer.filters = [this.displacementFilter]; // Apply here.

        // Create atmospheric effect for the road.
        // First, we create the gradient canvas
        const qualityAtm = 64;
        const canvasAtm = document.createElement('canvas');
        canvasAtm.width = 1;
        canvasAtm.height = qualityAtm;

        const ctxAtm = canvasAtm.getContext('2d');
        const grdAtm = ctxAtm.createLinearGradient(0, 0, 0, qualityAtm);
        grdAtm.addColorStop(0, `rgba(143, 235, 218, ${this.atmosphericAlpha})`);
        grdAtm.addColorStop(1, 'rgba(143, 235, 218, 0.0)');

        ctxAtm.fillStyle = grdAtm;
        ctxAtm.fillRect(0, 0, 1, qualityAtm);

        // Create the sprite and position it.
        this.floorAtm = new PIXI.Sprite(PIXI.Texture.from(canvasAtm));
        this.floorAtm.anchor.set(0.5, 0);

        /*
            End of floor creation with road
            begin with floordecor spawns
        */
        // This floor containers is useful to store the floor decorations
        // Randomly generate floor decorations

        this.floorDecorContainer = new PIXI.projection.Container2d();
        for (var i = 0; i < this.initialDecor; i++) {
            this.floorDecorContainer.addChild(this.makeDecor(null, randomRange(-8000, -100)));
        }

        // Create the backgrounds
        // Front background
        this.frontBG = new PIXI.TilingSprite(
            pixiRef.resources.backgroundfront.texture,
            pixiRef.app.screen.width,
            pixiRef.resources.backgroundfront.texture.height,
        );
        this.frontBG.anchor.set(0.5, 1);
        this.frontBG.scale.set(3, 3);
        
        // back background
        this.backBG = new PIXI.Sprite(pixiRef.resources.backgroundback.texture)
        this.backBG.anchor.set(0.5, 1);
        this.backBG.scale.set(3, 3);
        
        /*
            Add everything to the container.
        */
        // Add back background to the back of the container
        this.floorContainer.addChild(this.backBG);
        // Adds front background to the front
        this.floorContainer.addChild(this.frontBG);

        // Adds to all the floor to the container
        this.floorContainer.addChild(this.floor); // Add floor
        this.floorContainer.addChild(this.displacementSprite); // Add displacement to the main container
        this.wholeContainer.addChild(this.floorContainer);

        this.floorContainer.addChild(this.floorAtm);

        this.mainContainer = this.wholeContainer; // Add main container to canvas.

        // Add container about the grass
        this.bruhContainer = new PIXI.projection.Container2d();
        this.floorContainer.addChild(this.bruhContainer);
        this.bruhContainer.addChild(this.floorDecorContainer);

        // Position everything
        this.onResize();
    }

    loop(delta) {
        // Move the floor decoration
        this.bruhContainer.proj.setAxisY({x: -this.projPoint.x, y: -this.projPoint.y}, -this.factor);
        this.floor.tileProj.setAxisY(this.projPoint, this.factor);
    }

    onResize() {
        this.floor.position.set(this.app.screen.width/2, this.app.screen.height);

        this.projPoint.y = -this.horizonY();

        this.displacementSprite.width = Math.max(this.app.screen.width, 800);
        this.displacementSprite.height = this.horizonY() - this.displace_y_correction;

        this.displacementSprite.x = this.app.screen.width/2;
        this.displacementSprite.y = this.horizonY() + this.displace_y_correction;

        this.floor.width = this.app.screen.width;
        this.floor.height = this.horizonY() * this.yScale;

        this.frontBG.width = this.app.screen.width;
        this.frontBG.x = this.app.screen.width/2;
        this.frontBG.y = this.app.screen.height - this.horizonY() * 1.1;

        this.backBG.x = this.app.screen.width/2 + XPROJECTIONOFFSET;
        this.backBG.y = this.app.screen.height - this.horizonY()*1.1;

        this.floorAtm.x = this.app.screen.width/2;
        this.floorAtm.y = this.app.screen.height - this.horizonY()*1.1;
        this.floorAtm.width = this.app.screen.width;
        this.floorAtm.height = this.horizonY()/3;

        this.floorDecorYSpawn = this.app.screen.height + this.yOffset - this.horizonY() * this.yScale;

        this.bruhContainer.position.set(this.app.screen.width / 2, this.app.screen.height);
    }

    makeDecor(x=null, y=null) {
        // This function randomly generates a cloud.
        let grass = new PIXI.projection.Sprite2d(randomProperty(this.floorDecorTex.textures));
        
        grass.scale.set(8, 8);
        grass.anchor.set(0.5, 1);

        // Set the projection to be upright from the user.
        grass.proj.affine = PIXI.projection.AFFINE.AXIS_X;

        // Set random position
        grass.position.set(
            x == null ? randomRange(-this.app.screen.width*10, this.app.screen.width*10) : x,
            y == null ? -8000 : y
        );

        return grass;
    }
}