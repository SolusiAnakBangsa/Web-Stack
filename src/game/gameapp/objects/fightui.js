import { GameObject } from "./gameobject";
import { ShadowShader } from "./../shadowshader";
import { propertyLength } from "./../../../script/util";

const HEALTHBARLENGTH = 174 * 3;
const HEALTHBARHEIGHT = 9 * 3;
const HEALTHBARXOFFSET = 31 * 3;
const HEALTHBARYOFFSET = 6 * 3;

const ACUALHEALTHBARLENGTH = (app) => Math.min(HEALTHBARLENGTH, app.screen.width - 150);

const ENEMYOFFSETY = 120;
const ENEMYOFFSETX = 270;

const TEXTOFFSETY = 56;

const COUNTERBARLENGTH = 800;
const ACTUALCOUNTERBARLENGTH = (app) => Math.min(COUNTERBARLENGTH, app.screen.width - 100);
const COUNTERBARYPOS = 52;
const COUNTERBARPADDING = 4;

const WORKOUTFONTSIZE = 80;

export class FightUI extends GameObject {

    constructor(pixiRef) {
        super(pixiRef);
        this.enemyHealthP = 0.8;
        this.workoutP = 0.5;

        this.enemyName = "Legolus";
        this.nameText;
        this.workoutText;
        this.workoutCounter;

        this.enemyPosOffset = {x: 0, y: 0};
        this.flying = false;

        this.enemyList = [
            {name: "Legolus", res: pixiRef.resources.legolus},
            {name: "Absogus", res: pixiRef.resources.absogus},
            {name: "Armogus", res: pixiRef.resources.armogus},
        ];

        this.setup(pixiRef);
    }

    setup(pixiRef) {
        super.setup(pixiRef);

        this.enemyCont = new PIXI.Container();

        // Enemy sprite
        this.enemy = new PIXI.spine.Spine(pixiRef.resources.legolus.spineData);
        this.enemy.scale.set(4);
    
        // Setup the shadows
        this.enemyShadow = new ShadowShader([-0.6, -0.6], 0, 0.15);
        this.enemy.filters = [this.enemyShadow];

        // Enemy name
        this.nameStyle = new PIXI.TextStyle({
            fill: "#1C2A6C",
            fontFamily: "Thoughts",
            fontStyle: "italic",
            fontVariant: "small-caps",
            // fontWeight: "bold",
            padding: 64,
            fontSize: 80,
        });
        this.nameText = new PIXI.Text(this.enemyName, this.nameStyle);
        this.nameText.anchor.set(1, 0);

        // Make enemy health
        this.enemyHealth = new PIXI.Sprite(pixiRef.resources.enemyhealth.texture);
        this.enemyHealth.anchor.set(1, 0);
        this.enemyHealth.scale.set(3, 3);

        // Enemy health bar
        this.enemyProgressBar = new PIXI.Graphics();

        // Workout text
        this.textContainer = new PIXI.Container();
        this.workoutStyle = new PIXI.TextStyle({
            dropShadow: true,
            dropShadowAngle: 0.5,
            dropShadowColor: "#55b0fb",
            dropShadowDistance: 14,
            letterSpacing: -5,
            align: "center",
            fill: [
                "#fb9b0b",
                "#f46200"
            ],
            fontFamily: "\"Arial Black\", Gadget, sans-serif",
            fontSize: WORKOUTFONTSIZE,
            fontStyle: "italic",
            fontVariant: "small-caps",
            padding: 64,
            stroke: "#571c9f",
            strokeThickness: 14,
            align: "right",
            lineHeight: 74,
        });
        this.workoutCounterStyle = new PIXI.TextStyle({
            fill: "white",
            fontFamily: "Verdana",
            fontWeight: "bold",
            fontSize: 40
        });

        this.workoutText = new PIXI.Text("Push up", this.workoutStyle); // Displaying workout text
        this.workoutCounter = new PIXI.Text("10", this.workoutCounterStyle); // Displaying counter

        this.workoutText.anchor.set(1, 1);
        this.workoutCounter.anchor.set(0.5, 0.5);

        // Graphics for displaying counter
        this.workoutGraphic = new PIXI.Graphics();

        this.enemyCont.addChild(this.enemy);

        this.textContainer.addChild(this.workoutGraphic);
        this.textContainer.addChild(this.workoutText);
        this.textContainer.addChild(this.workoutCounter);
        this.mainContainer.addChild(this.nameText);
        this.mainContainer.addChild(this.enemyCont);
        this.mainContainer.addChild(this.enemyProgressBar);
        this.mainContainer.addChild(this.enemyHealth);
        this.mainContainer.addChild(this.textContainer);

        this._redrawEnemyHealth();
    }

    setWorkoutText(text) {
        this.workoutText.text = text;
        // Scale them text to fit, if it's bigger than the counter bar length.
        const textWidth = this.workoutText.width;
        const targetWidth = ACTUALCOUNTERBARLENGTH(this.app) - 50;

        if (textWidth > targetWidth) {
            const ratio = targetWidth/textWidth;
            // Scales the text by modyfing the fontSize
            this.workoutStyle.fontSize = WORKOUTFONTSIZE*ratio;
        } else {
            this.workoutStyle.fontSize = WORKOUTFONTSIZE;
        }
    }

    changeEnemy() {
        const en = this.enemyList[Math.floor(Math.random()*this.enemyList.length)];
        this.nameText.text = en.name;

        // Remove from main container.
        this.enemyCont.removeChild(this.enemy);

        // Reset enemy offset
        this.enemyPosOffset = {x: 0, y: 0};
        this.flying = false;
        
        // FIX: Kinda jank, maybe can just change the spinedata in the enemy object.
        // Enemy sprite
        this.enemy = new PIXI.spine.Spine(en.res.spineData);
        this.enemy.scale.set(4);
        this.enemy.state.setAnimation(0, 'idle', true);
        this.enemy.stateData.setMix('idle', 'fly', 0.2);
        this.enemy.stateData.setMix('fly', 'idle', 0.2);
    
        // Setup the shadows
        this.enemy.filters = [this.enemyShadow];
        this.onResize();

        this.enemyCont.addChild(this.enemy);
    }

    flyEnemy() {
        // Knock enemy to the right.
        this.flying = true;
        this.enemy.state.setAnimation(0, 'fly', true, 0);
    }

    _redrawEnemyHealth() {
        this.enemyProgressBar.clear();

        const ACTUALHEALTHBARLEN = ACUALHEALTHBARLENGTH(this.app);

        // Draw health bar portion
        this.enemyProgressBar.beginFill(0x982134);
        this.enemyProgressBar.drawRect(
            this.enemyHealth.x - HEALTHBARXOFFSET,
            this.enemyHealth.y + HEALTHBARYOFFSET,
            -ACTUALHEALTHBARLEN * this.enemyHealthP,
            HEALTHBARHEIGHT
        );
        this.enemyProgressBar.endFill();

        // Draw health bar borders
        this.enemyProgressBar.lineStyle(3, 0x1c2a6d, 1);
        this.enemyProgressBar.drawRoundedRect(
            this.enemyHealth.x - HEALTHBARXOFFSET - ACTUALHEALTHBARLEN,
            this.enemyHealth.y + HEALTHBARYOFFSET,
            ACTUALHEALTHBARLEN + 3,
            HEALTHBARHEIGHT,
            4
        );

        this.enemyProgressBar.lineStyle(0);
    }

    _redrawWorkoutBar() {
        // Calculate actual length based on screen width
        const ACTUALLENGTH = ACTUALCOUNTERBARLENGTH(this.app);

        this.workoutGraphic.clear();

        const BARHEIGHT = 24;

        // Draw empty bar completion.
        this.workoutGraphic.beginFill(0x26274d);
        this.workoutGraphic.drawRoundedRect(
            this.workoutCounter.x,
            this.workoutCounter.y - BARHEIGHT/2,
            ACTUALLENGTH,
            BARHEIGHT,
            20
        );

        const BARVERTICALPADDING = 3;
        
        // Draw actual progress
        this.workoutGraphic.beginFill(0xFC9E23);
        this.workoutGraphic.drawRoundedRect(
            this.workoutCounter.x,
            this.workoutCounter.y - BARHEIGHT/2 + BARVERTICALPADDING,
            ACTUALLENGTH * this.workoutP - BARVERTICALPADDING,
            BARHEIGHT - BARVERTICALPADDING*2,
            20
        );

        this.workoutGraphic.beginFill(0x2e256b);
        // Draw text border box
        this.workoutGraphic.drawRoundedRect(
            this.workoutCounter.x - this.workoutCounter.width/2 - COUNTERBARPADDING*4,
            this.workoutCounter.y - this.workoutCounter.height/2 - COUNTERBARPADDING,
            this.workoutCounter.width + COUNTERBARPADDING*8,
            this.workoutCounter.height + COUNTERBARPADDING*2,
            20
        );

        this.workoutGraphic.endFill();
    }

    loop(delta) {
        const speed = 20;
        if (this.flying) {
            this.enemyPosOffset.x += speed;
            this.enemyPosOffset.y -= speed/2;
            this.enemy.x += speed;
            this.enemy.y -= speed/2;
            this.enemyShadow.uniforms.floorY += speed/2;

            if (this.enemyPosOffset.x > 1000) {
                this.flying = false;    
            }
        }
    }

    onResize() {
        this.enemyHealth.position.set(
            this.app.screen.width - 8,
            8
        );

        this.nameText.position.set(
            this.app.screen.width - 120,
            40
        );

        // Texts
        // Calculate actual length based on screen width
        const ACTUALLENGTH = ACTUALCOUNTERBARLENGTH(this.app);
        this.workoutText.position.set(
            this.app.screen.width/2 + ACTUALLENGTH/2,
            this.app.screen.height - TEXTOFFSETY,
        );
        this.workoutCounter.position.set(
            this.app.screen.width/2 - ACTUALLENGTH/2,
            this.app.screen.height - COUNTERBARYPOS,
        );

        this.enemy.position.set(
            this.app.screen.width - ENEMYOFFSETX + this.enemyPosOffset.x,
            this.app.screen.height - ENEMYOFFSETY + this.enemyPosOffset.y,
        );
        this.enemyShadow.uniforms.floorY = this.enemy.y + this.enemyPosOffset.y;

        this._redrawEnemyHealth();
        this._redrawWorkoutBar();
    }
}