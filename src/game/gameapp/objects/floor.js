import { GameObject } from "./gameobject";
import { randomRange, randomProperty } from "./../../../script/util";

export class Floor extends GameObject {

    constructor(pixiRef, drawTo) {
        // Object to render the floor in the game.
        super(pixiRef, drawTo);

        this.floorSpeed = 14;

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
        this.floorDecorYSpawn = this.app.screen.height + this.yOffset - this.horizonY() * this.yScale;

        // Counter to check
        // If the speed changes, this should change too.
        // The baseline range should be [400, 800] if the floorSpeed is 14.
        // Increases and decreases linearly. (If floorSpeed == 7, then range [800, 1600])
        // Formula is 14/speed*400, 14/speed*800 == 5600/speed, 11200
        this.counterRange = [400, 800]; // Milliseconds range to spawn the floor decorations
        this.counter = 0;
        this.counterBound = randomRange(...this.counterRange); // Check every 500ms

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

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
        this.floor.position.set(pixiRef.app.screen.width/2, pixiRef.app.screen.height);
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
        this.road.position.set(pixiRef.app.screen.width/2, pixiRef.app.screen.height);
        this.road.tileScale.set(scale, scale);
        
        // We need to create a mask so that the road tiling does not mess up.
        // The road mask shall be created inside a new container, and placed bottom middle.
        this.bruhContainer = new PIXI.projection.Container2d();
        this.bruhContainer.position.set(pixiRef.app.screen.width / 2, pixiRef.app.screen.height);

        this.bruh = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
        this.bruh.width = pixiRef.resources.landroad.texture.width*scale;
        this.bruh.height = pixiRef.app.screen.height*14 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.
        this.bruh.anchor.set(0.5, 1.0);
        
        this.road.mask = this.bruh; // Set the mask here
        
        // Here, lets create a displacement map, to distort the horizon, as if we are walking on a sphere.

        this.displacementSprite = PIXI.Sprite.from(pixiRef.resources.landdisplacement.texture);
        this.displacementSprite.anchor.set(0.5, 0);
        this.displacementSprite.width = pixiRef.app.screen.width;
        this.displacementSprite.height = this.horizonY() - this.displace_y_correction;

        this.displacementSprite.x = pixiRef.app.screen.width/2;
        this.displacementSprite.y = this.horizonY();
        
        // Create the filter from the displacement sprite. Then, apply the filter to the floor
        this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
        this.displacementFilter.padding = 150; // Giving extra space for the filter to work.
        this.displacementFilter.scale.set(0, 80); // This represents how much the maximum horizon distortion map in pixels.

        this.floorContainer.filters = [this.displacementFilter]; // Apply here.

        /*
            End of floor creation with road
            begin with floordecor spawns
        */
       // This floor containers is useful to store the floor decorations
       this.floorDecorContainer = new PIXI.projection.Container2d();

        // Adds to all the floor to the container
        this.floorContainer.addChild(this.floor); // Add floor
        this.floorContainer.addChild(this.road); // Add road
        this.bruhContainer.addChild(this.bruh); // Add mask to maskcontainer
        this.floorContainer.addChild(this.bruhContainer); // Add maskcontainer to main container
        this.floorContainer.addChild(this.displacementSprite); // Add displacement to the main container
        this.mainContainer = this.floorContainer; // Add main container to canvas.

        // Add container about the grass
        this.bruhContainer.addChild(this.floorDecorContainer);
    }

    loop(delta) {
        // Move the floor decoration
        for (let dec of this.floorDecorContainer.children) {
            dec.y += this.floorSpeed;
        }

        // Update the range according to floorSpeed.
        this.counterRange = [5600/this.floorSpeed, 11200/this.floorSpeed]

        this.counter += delta;
        if (this.counter > this.counterBound) {

            // Spawn a new floor decor at a random location.
            this.floorDecorContainer.addChild(this.makeDecor());

            // Delete all the floor decoration outside the bounds
            for (let dec of this.floorDecorContainer.children) {
                if (dec.y > 20) {
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

        this.displacementSprite.width = this.app.screen.width;
        this.displacementSprite.height = this.horizonY() - this.displace_y_correction;

        this.displacementSprite.x = this.app.screen.width/2;
        this.displacementSprite.y = this.horizonY() + this.displace_y_correction;

        this.floor.width = this.app.screen.width;
        this.floor.height = this.horizonY() * this.yScale;

        this.road.width = this.app.screen.width;
        this.road.height = this.horizonY() * this.yScale;

        this.floorDecorYSpawn = this.app.screen.height + this.yOffset - this.horizonY() * this.yScale;
    }

    makeDecor() {
        // This function randomly generates a cloud.
        let grass = new PIXI.projection.Sprite2d(randomProperty(this.floorDecorTex.textures));
        
        grass.scale.set(8, 8);
        grass.anchor.set(0.5, 1);

        // Set the projection to be upright from the user.
        grass.proj.affine = PIXI.projection.AFFINE.AXIS_X;

        // Set random position
        grass.position.set(
            randomRange(-this.app.screen.width*10, this.app.screen.width*10),
            -8000
        );

        return grass;
    }
}