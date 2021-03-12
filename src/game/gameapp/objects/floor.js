import { GameObject } from "./gameobject";
import { randomRange, randomFour, randomProperty } from "./../../../script/util";

export class Floor extends GameObject {

    constructor(pixiRef, drawTo) {
        // Object to render the floor in the game.
        super(pixiRef, drawTo);

        this.atmosphericAlpha = 0.2;
        this.floorSpeed = 14;
        this.spawnMultiplier = 3; // Multiplier of how often does the grass spawn.
        this.initialDecor = 40; // Number of initial decor objects

        this.horizonY = () => pixiRef.app.screen.height/2.3;

        // Projection properties
        this.projPoint = new PIXI.Point(0, -this.horizonY());
        this.factor = 0.875;

        // Displace correction useful so that the displacement map is offset above the horizon line.
        this.displace_y_correction = -150;
        this.yScale = 1.1; // YScale is used to scale the height of the floor projection tile.
        this.yOffset = 50; // Offsets the floor.

        // Textures from a spritesheet for the floor decorations
        this.floorDecorTex = pixiRef.resources.floorDecor.spritesheet;

        // Counter to check
        // If the speed changes, this should change too.
        // The baseline range should be [400, 800] if the floorSpeed is 14.
        // Increases and decreases linearly. (If floorSpeed == 7, then range [800, 1600])
        // Formula is 14/speed*400, 14/speed*800 == 5600/speed, 11200
        this.counterRange = [400/this.spawnMultiplier, 800/this.spawnMultiplier]; // Milliseconds range to spawn the floor decorations
        this.counter = 0;
        this.counterBound = randomRange(...this.counterRange); // Check every 500ms

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

        // Loads the texture of the road, and positions it in the bottom center of the screen too.
        // Rotate texture 180 degrees
        pixiRef.resources.landroad.texture.rotate = 4;
        this.road = new PIXI.projection.TilingSprite2d(
            pixiRef.resources.landroad.texture,
            pixiRef.resources.landroad.texture.width*scale, // Road width is the same as the sprite
            this.horizonY() * this.yScale,
        );
        this.road.tilePosition.x += pixiRef.resources.landroad.texture.width/2*scale; // Offset by half
        this.road.anchor.set(0.5, 1.0);
        this.road.tileScale.set(scale, scale);
        
        // We need to create a mask so that the road tiling does not mess up.
        // The road mask shall be created inside a new container, and placed bottom middle.
        this.bruhContainer = new PIXI.projection.Container2d();

        this.bruh = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
        this.bruh.width = pixiRef.resources.landroad.texture.width*scale;
        this.bruh.height = pixiRef.app.screen.height*14 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.
        this.bruh.anchor.set(0.5, 1.0);
        
        this.road.mask = this.bruh; // Set the mask here
        
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
        this.backBG = new PIXI.Sprite(pixiRef.resources.backgroundback.texture);
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
        this.floorContainer.addChild(this.road); // Add road
        this.bruhContainer.addChild(this.bruh); // Add mask to maskcontainer
        this.floorContainer.addChild(this.bruhContainer); // Add maskcontainer to main container
        this.floorContainer.addChild(this.displacementSprite); // Add displacement to the main container
        this.wholeContainer.addChild(this.floorContainer);

        this.floorContainer.addChild(this.floorAtm);

        this.mainContainer = this.wholeContainer; // Add main container to canvas.

        // Add container about the grass
        this.bruhContainer.addChild(this.floorDecorContainer);

        // Call positioning
        this.onResize();
    }

    loop(delta) {
        // Move the floor decoration
        for (let dec of this.floorDecorContainer.children) {
            dec.y += this.floorSpeed;
        }

        this.counter += delta;
        if (this.counter > this.counterBound) {

            // Spawn a new floor decor at a random location.
            this.floorDecorContainer.addChild(this.makeDecor());

            // Delete all the floor decoration outside the bounds
            for (let dec of this.floorDecorContainer.children) {
                if (dec.y > -100) {
                    this.floorDecorContainer.removeChild(dec);
                }
            }

            // Reset counter
            this.counter -= this.counterBound;
            this.counterBound = randomRange(...this.counterRange);
        }

        this.floor.tileProj.setAxisY(this.projPoint, this.factor);
        this.road.tileProj.setAxisY(this.projPoint, this.factor);

        // Reverse the projPoint
        this.bruhContainer.proj.setAxisY({x: -this.projPoint.x, y: -this.projPoint.y}, -this.factor);

        // Make the floor move
        this.road.tilePosition.y -= this.floorSpeed;
        this.floor.tilePosition.y -= this.floorSpeed;
    }

    onResize() {
        this.floor.position.set(this.app.screen.width/2, this.app.screen.height);
        this.road.position.set(this.app.screen.width/2, this.app.screen.height);

        this.projPoint.y = -this.horizonY();

        this.bruhContainer.position.set(this.app.screen.width / 2, this.app.screen.height);
        this.bruh.height = this.app.screen.height*14 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.

        this.displacementSprite.width = Math.max(this.app.screen.width, 800);
        this.displacementSprite.height = this.horizonY() - this.displace_y_correction;

        this.displacementSprite.x = this.app.screen.width/2;
        this.displacementSprite.y = this.horizonY() + this.displace_y_correction;

        this.floor.width = this.app.screen.width;
        this.floor.height = this.horizonY() * this.yScale;

        this.frontBG.width = this.app.screen.width;
        this.frontBG.x = this.app.screen.width/2;
        this.frontBG.y = this.app.screen.height - this.horizonY() * 1.1;

        this.backBG.x = this.app.screen.width/2
        this.backBG.y = this.app.screen.height - this.horizonY()*1.1;

        this.floorAtm.x = this.app.screen.width/2;
        this.floorAtm.y = this.app.screen.height - this.horizonY()*1.1;
        this.floorAtm.width = this.app.screen.width;
        this.floorAtm.height = this.horizonY()/3;

        this.road.width = this.app.screen.width;
        this.road.height = this.horizonY() * this.yScale;
    }

    setFloorSpeed(speed) {
        this.floorSpeed = speed;
        // Change range
        this.counterRange = [5600/this.spawnMultiplier/speed, 11200/this.spawnMultiplier/speed]
        // Generate new counter
        this.counterBound = randomRange(...this.counterRange);
    }

    makeDecor(x=null, y=null) {
        // This function randomly generates a cloud.
        let grass = new PIXI.projection.Sprite2d(randomProperty(this.floorDecorTex.textures));
        
        grass.scale.set(8, 8);
        grass.anchor.set(0.5, 1);

        // Set the projection to be upright from the user.
        grass.proj.affine = PIXI.projection.AFFINE.AXIS_X;

        // Set x random spawn. so that the grass does not spawn on the road.
        const roadWidthHalf = this.bruh.width/2

        // Set random position
        grass.position.set(
            x == null ? randomFour(-this.app.screen.width*10, -roadWidthHalf, roadWidthHalf, this.app.screen.width*10) : x,
            y == null ? -8000 : y
        );

        return grass;
    }
}