import { GameObject } from "./gameobject";

export class Floor extends GameObject {

    constructor(pixiRef, drawTo) {
        // Object to render the floor in the game.
        super(pixiRef, drawTo);

        this.floorSpeed = 5;
        this.projPoint = new PIXI.Point(0, -pixiRef.app.screen.height/2);
        this.factor = 0.875;

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        const floorContainer = new PIXI.projection.Container2d();

        // Loads the floor texture and positions it in the bottom center of the screen.
        const floor = new PIXI.projection.TilingSprite2d(
                pixiRef.resources.landsurface.texture,
                pixiRef.app.screen.width,
                pixiRef.app.screen.height/2,
            );
        floor.anchor.set(0.5, 1.0);
        floor.position.set(pixiRef.app.screen.width/2, pixiRef.app.screen.height);

        // Loads the texture of the road, and positions it in the bottom center of the screen too.
        const road = new PIXI.projection.TilingSprite2d(
            pixiRef.resources.landroad.texture,
            pixiRef.resources.landroad.texture.width, // Road width is the same as the sprite
            pixiRef.app.screen.height/2,
        );
        road.tilePosition.x += pixiRef.resources.landroad.texture.width/2; // Offset by half
        road.anchor.set(0.5, 1.0);
        road.position.set(pixiRef.app.screen.width/2, pixiRef.app.screen.height);
        
        // We need to create a mask so that the road tiling does not mess up.
        // The road mask shall be created inside a new container, and placed bottom middle.
        const bruhContainer = new PIXI.projection.Container2d();
        bruhContainer.position.set(pixiRef.app.screen.width / 2, pixiRef.app.screen.height);

        const bruh = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
        bruh.width = pixiRef.resources.landroad.texture.width;
        bruh.height = pixiRef.app.screen.height*4 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.
        bruh.anchor.set(0.5, 1.0);
        
        road.mask = bruh; // Set the mask here
        
        // Here, lets create a displacement map, to distort the horizon, as if we are walking on a sphere.
        // Displace correction useful so that the displacement map is offset above the horizon line.
        const DISPLACE_Y_CORRECTION = -150;

        const displacementSprite = PIXI.Sprite.from(pixiRef.resources.landdisplacement.texture);
        displacementSprite.anchor.set(0.5, 0);
        displacementSprite.width = pixiRef.app.screen.width;
        displacementSprite.height = pixiRef.app.screen.height/2 - DISPLACE_Y_CORRECTION;

        displacementSprite.x = pixiRef.app.screen.width/2;
        displacementSprite.y = pixiRef.app.screen.height/2 + DISPLACE_Y_CORRECTION;
        
        // Create the filter from the displacement sprite. Then, apply the filter to the floor
        const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
        displacementFilter.padding = 150; // Giving extra space for the filter to work.
        displacementFilter.scale.set(0, 120);

        floorContainer.filters = [displacementFilter]; // Apply here.

        floorContainer.addChild(floor); // Add floor
        floorContainer.addChild(road); // Add road
        bruhContainer.addChild(bruh); // Add mask to maskcontainer
        floorContainer.addChild(bruhContainer); // Add maskcontainer to main container
        floorContainer.addChild(displacementSprite); // Add displacement to the main container
        this.drawTo.addChild(floorContainer); // Add main container to canvas.
        
        // Add ticker to update the projection in real time.
        pixiRef.app.ticker.add(() => {

            floor.tileProj.setAxisY(this.projPoint, this.factor);
            road.tileProj.setAxisY(this.projPoint, this.factor);

            // Reverse the projPoint
            bruhContainer.proj.setAxisY({x: -this.projPoint.x, y: -this.projPoint.y}, -this.factor);

            // Make the floor move
            road.tilePosition.y -= this.floorSpeed;
            floor.tilePosition.y -= this.floorSpeed;
        });
    }
}