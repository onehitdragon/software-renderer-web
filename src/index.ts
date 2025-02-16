import { Vec3 } from "./common/vector";
import { Scene, canvas, ctx, cubeModel } from "./global";
import * as gui from "./gui";
import { renderScene } from "./helper";
import dsPath from "../assets/uploads_files_3262252_r8.3ds";
import { loadModelAtPath } from "./3dsModelLoader";

async function Main(){
    // Prepare scene
    const scene: Scene = {
        instances: [
            // {
            //     model: cubeModel,
            //     transform: {
            //         scale: 1,
            //         rotation: 0,
            //         translation: { x: 0, y: 0, z: 4.5 }
            //     }
            // },
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

    const model = await loadModelAtPath(dsPath);
    console.log(model);
    scene.instances.push(
        {
            model: model,
            transform: {
                scale: 0.025,
                rotation: 0,
                translation: { x: 0, y: 0, z: 4.5 }
            }
        },
    );

    // UI
    for(const instance of scene.instances){
        gui.addIntanceGui(instance);
    }
    const [updateMonitor, renderStatus] = gui.showMonitor();

    // Loop
    function Loop(){
        renderScene(scene, renderStatus);
        updateMonitor();

        //requestAnimationFrame(Loop);
    }
    requestAnimationFrame(Loop);
}

Main();