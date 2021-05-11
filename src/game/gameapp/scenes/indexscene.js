import { Scene } from "./../scene";
import { IndexMan } from "../objects/indexman"

export class IndexScene extends Scene {
    constructor(pixiRef, controller) {
        super(pixiRef, controller);
    }

    setup(pixiRef) {
        this.indexMan = new IndexMan(pixiRef);

        this.addObj(this.indexMan);
        this.onResize();
    }

    // loopCode(delta) {
        
    // }
}
