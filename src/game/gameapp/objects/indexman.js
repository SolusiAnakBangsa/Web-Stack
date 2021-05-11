import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";
import { clamp } from "./../../../script/util";

var SCALE = 4;

// Length of the leg to droop from the ceiling
// const LEGLENGTH = 30;
const LEGLENGTH = 58;

// Floor height the guy will fall to
const FLOORHEIGHT = 64;

// Man height for scaling.
const MANHEIGHT = 150;

export class IndexMan extends GameObject {
    constructor(pixiRef) {
        super(pixiRef);

        this.falling = false;
        this.fallSpeed = 0;
        this.fallAccel = 0.5;
        this.yPos = 0;

        this.delMan = false; // Helper to delete the first man.

        // Whether the man has landed
        this.land = false;

        this.setup();
    }

    // Helper function to add a listeener and clear them.
    _addCompleteClear(obj, callback) {
        obj.state.clearListeners();
        obj.state.addListener({ complete: callback });
    }

    // Order 0
    _animFall() {
        this.indexMan2.state.clearListeners();
        this.falling = true;
    }

    // Order 1
    _animLand() {
        this.indexMan2.state.clearTracks();
        this.indexMan2.state.setAnimation(0, 'IndexLand', false);
        this._addCompleteClear(this.indexMan2, this._animHi.bind(this));
        this.land = true;
    }

    // Order 2
    // Switch animation
    _animHi() {
        this.delMan = true;
    }

    // Setup animation drop down until hi
    _setupAnims() {

        // Add first animation man
        this.manContainer.addChild(this.indexMan2);

        // Mixes
        this.indexMan2.stateData.setMix('IndexDropDown', 'IndexFall', 0.1);
        this.indexMan2.stateData.setMix('IndexFall', 'IndexLand', 0.3);
        this.indexMan.stateData.setMix('Hello', 'IdleDown', 0.3);

        this._addCompleteClear(this.indexMan2, this._animFall.bind(this));

        // Do the animations
        this.indexMan2.state.addAnimation(0, 'IndexDropDown', false, 0);
        this.indexMan2.state.addAnimation(0, 'IndexFall', true, 0);
    }

    setup() {
        this.indexMan = new PIXI.spine.Spine(this.pixiRef.resources.fightman.spineData);
        this.indexMan2 = new PIXI.spine.Spine(this.pixiRef.resources.fightman2.spineData);

        this.manContainer = new PIXI.Container();

        // Setup the shadows
        this.manShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.manShadow.padding = this.app.screen.height;
        this.manContainer.filters = [this.manShadow];

        // Container
        this.mainContainer.addChild(this.manContainer);

        this._setupAnims();

        this.onResize();
    }

    loop() {
        if (this.falling) {
            this.fallSpeed += this.fallAccel;

            const pos = this.manContainer.position;
            const s = this.app.screen

            pos.y += this.fallSpeed;
            this.yPos += this.fallSpeed;

            if (pos.y > (s.height - FLOORHEIGHT)) {
                this.falling = false;
                pos.y = s.height - FLOORHEIGHT;
                this._animLand();
            }
        }

        if (this.delMan) {

            console.log("Bruh");

            // Do animation
            this.indexMan.state.setAnimation(0, 'Hello', false);
            this.indexMan.state.addAnimation(0, 'IdleDown', true, 0);

            // Switch animation guy
            this.manContainer.addChild(this.indexMan);
            this.manContainer.removeChild(this.indexMan2);

            this.delMan = false;
        }
    }

    onResize() {
        const s = this.app.screen;

        // Set scales
        SCALE = clamp(Math.floor(s.height / MANHEIGHT), 1, 4);

        this.manContainer.scale.set(SCALE);
        this.manContainer.scale.x = -SCALE;

        var y;

        if (this.land) {
            y = s.height - FLOORHEIGHT;
        } else {
            y = LEGLENGTH * SCALE + this.yPos;
        }

        this.manContainer.position.set(
            s.width/2 - 32,
            y
        );

        this.manShadow.uniforms.floorY = s.height - FLOORHEIGHT;
    }
}
