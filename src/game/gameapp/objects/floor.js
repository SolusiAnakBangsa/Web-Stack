import { GameObject } from "./gameobject";

export class Floor extends GameObject {

    constructor(pixiRef, drawTo) {
        // Object to render the floor in the game.
        super(pixiRef, drawTo);

        this.floorSpeed = 1;

        // Projection properties
        this.projPoint = new PIXI.Point(0, -pixiRef.app.screen.height/2);
        this.factor = 0.875;

        // Displace correction useful so that the displacement map is offset above the horizon line.
        this.displace_y_correction = -150;

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        // Floor container
        this.floorContainer = new PIXI.projection.Container2d();

        // Pixel scale.
        const scale = 4;

        // Loads the floor texture and positions it in the bottom center of the screen.
        // Rotate texture 180 degrees
        pixiRef.resources.landsurface.texture.rotate = 4;
        this.floor = new PIXI.projection.TilingSprite2d(
                pixiRef.resources.landsurface.texture,
                pixiRef.app.screen.width,
                pixiRef.app.screen.height/2,
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
            pixiRef.app.screen.height/2,
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
        this.bruh.height = pixiRef.app.screen.height*4 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.
        this.bruh.anchor.set(0.5, 1.0);
        
        this.road.mask = this.bruh; // Set the mask here
        
        // Here, lets create a displacement map, to distort the horizon, as if we are walking on a sphere.

        this.displacementSprite = PIXI.Sprite.from(pixiRef.resources.landdisplacement.texture);
        this.displacementSprite.anchor.set(0.5, 0);
        this.displacementSprite.width = pixiRef.app.screen.width;
        this.displacementSprite.height = pixiRef.app.screen.height/2 - this.displace_y_correction;

        this.displacementSprite.x = pixiRef.app.screen.width/2;
        this.displacementSprite.y = pixiRef.app.screen.height/2 + this.displace_y_correction;
        
        // Create the filter from the displacement sprite. Then, apply the filter to the floor
        this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
        this.displacementFilter.padding = 150; // Giving extra space for the filter to work.
        this.displacementFilter.scale.set(0, 75); // This represents how much the maximum horizon distortion map in pixels.

        this.floorContainer.filters = [this.displacementFilter]; // Apply here.

        // Adds to all the container
        this.floorContainer.addChild(this.floor); // Add floor
        this.floorContainer.addChild(this.road); // Add road
        this.bruhContainer.addChild(this.bruh); // Add mask to maskcontainer
        this.floorContainer.addChild(this.bruhContainer); // Add maskcontainer to main container
        this.floorContainer.addChild(this.displacementSprite); // Add displacement to the main container
        this.drawTo.addChild(this.floorContainer); // Add main container to canvas.
    }

    loop(delta) {
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

        this.projPoint.y = -this.app.screen.height/2;

        this.bruhContainer.position.set(this.app.screen.width / 2, this.app.screen.height);
        this.bruh.height = this.app.screen.height*4 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.

        this.displacementSprite.width = this.app.screen.width;
        this.displacementSprite.height = this.app.screen.height/2 - this.displace_y_correction;

        this.displacementSprite.x = this.app.screen.width/2;
        this.displacementSprite.y = this.app.screen.height/2 + this.displace_y_correction;

        this.floor.width = this.app.screen.width;
        this.floor.height = this.app.screen.height/2;

        this.road.width = this.app.screen.width;
        this.road.height = this.app.screen.height/2;
    }
}