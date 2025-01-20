import { Vec3 } from "./common/vector";
import { Scene, canvas, ctx, cubeModel } from "./global";
import * as gui from "./gui";
import { renderScene } from "./helper";

const scene: Scene = {
    instances: [
        {
            model: cubeModel,
            transform: {
                scale: 2,
                rotation: 0,
                translation: { x: 0, y: 0, z: 4.5 }
            }
        },
        // {
        //     model: cubeModel,
        //     transform: {
        //         scale: 1,
        //         rotation: 0,
        //         translation: { x: 1, y: 2, z: 4.5 }
        //     }
        // }
    ]
};

for(const instance of scene.instances){
    gui.addIntanceGui(instance);
}

const [updateMonitor, renderStatus] = gui.showMonitor();
function Main(){
    renderScene(scene, renderStatus);
    updateMonitor();
}

function Loop(){
    Main();
    requestAnimationFrame(Loop);
}

requestAnimationFrame(Loop);
