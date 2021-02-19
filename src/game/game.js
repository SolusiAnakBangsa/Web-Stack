// Initial options for the game
const options = {
    width: 256,
    height: 256,
    resolution: 1,
    // forceCanvas: true,
    resizeTo: window, // Resize to the size of the browser window once.
};

// Make the application object
const app = new PIXI.Application(options);
// Change the DOM display to be block.
app.renderer.view.style.display = "block";
// Display in browser
document.body.appendChild(app.view);
/*
    INIT end
*/

function createFloor() {
    // Create a new container to contain the floor part of the game.
    const floorContainer = new PIXI.projection.Container2d();

    // Loads the floor texture
    const floor = new PIXI.projection.TilingSprite2d(
            PIXI.Texture.from('https://pixijs.io/examples/examples/assets/p2.jpeg'),
            app.screen.width,
            app.screen.height/2,
        );
    
    floor.anchor.set(0.5, 1.0);
    floor.position.set(app.screen.width/2, app.screen.height);

    // Loads the texture of the road
    const road = new PIXI.projection.TilingSprite2d(
        PIXI.Texture.from('road.png'),
        160,
        app.screen.height/2,
    );
    road.tilePosition.x += 400;

    const bruhContainer = new PIXI.projection.Container2d();
    bruhContainer.position.set(app.screen.width / 2, app.screen.height);
    const bruh = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
    bruh.width = 160;
    bruh.height = app.screen.height*4 + 1; // Times by 4 and added by 1 to make it long enough to reach the horizon.
    bruh.anchor.set(0.5, 1.0);
    
    road.anchor.set(0.5, 1.0);
    road.position.set(app.screen.width/2, app.screen.height);
    
    // Correction so that the displacement sprite is situated above a little bit
    const DISPLACE_Y_CORRECTION = -150;

    const displacementSprite = PIXI.Sprite.from('dudu.png');
    displacementSprite.anchor.set(0.5, 0);
    displacementSprite.width = app.screen.width;
    displacementSprite.height = app.screen.height/2 - DISPLACE_Y_CORRECTION;

    displacementSprite.x = app.screen.width/2;
    displacementSprite.y = app.screen.height/2 + DISPLACE_Y_CORRECTION;

    app.stage.addChild(floorContainer);
    floorContainer.addChild(floor);
    floorContainer.addChild(road);
    bruhContainer.addChild(bruh);
    floorContainer.addChild(bruhContainer);

    road.mask = bruh;

    // Make sure the sprite is wrapping.
    // displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    displacementFilter.padding = 150; // Giving extra space for the filter to work.
    displacementFilter.scale.set(0, 120);

    floorContainer.filters = [displacementFilter];

    app.stage.addChild(displacementSprite);

    app.ticker.add(() => {
        floor.tileProj.setAxisY(new PIXI.Point(0, -app.screen.height/2), 0.875);
        road.tileProj.setAxisY(new PIXI.Point(0, -app.screen.height/2), 0.875);
        bruhContainer.proj.setAxisY(new PIXI.Point(0, app.screen.height/2), -0.875); // I think i can create sprite in a sprite so that the transparent part can be large and can be tiled not gayly
        road.tilePosition.y -= 10;
        floor.tilePosition.y -= 10;
    });

    var floorObj = {
        floorContainer: floorContainer,
        floor: floor,
        displacement: {
            sprite: displacementSprite,
            filter: displacementFilter,
        },
    }

    return floorObj;
}

createFloor();

app.ticker.add(() => {
});

window.onresize = () => {
    
}