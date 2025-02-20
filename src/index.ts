import { Vec3 } from "./common/vector";
import { Scene, canvas, ctx, cubeModel } from "./global";
import * as gui from "./gui";
import { renderScene } from "./helper";
import dsPath from "../assets/Teapot.3ds";
import { loadModelAtPath } from "./3dsModelLoader";
import { fixedXY } from "./fixedNumber";

async function Main(){
    // Prepare scene
    const scene: Scene = {
        instances: [
            {
                model: cubeModel,
                transform: {
                    scale: 1,
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

    // const model = await loadModelAtPath(dsPath);
    // scene.instances.push(
    //     {
    //         model: model,
    //         transform: {
    //             scale: 0.025,
    //             rotation: 0,
    //             translation: { x: 0, y: 0, z: 4.5 }
    //         }
    //     },
    // );

    // UI
    for(const instance of scene.instances){
        gui.addIntanceGui(instance);
    }
    const [updateMonitor, renderStatus] = gui.showMonitor();

    // Loop
    function Loop(){
        // scene.instances[0].transform.rotation += 0.5;
        renderScene(scene, renderStatus);
        updateMonitor();

        requestAnimationFrame(Loop);
    }
    requestAnimationFrame(Loop);
}

Main();

const p = fixedXY({ x: 3.5, y: 4.5 });
console.log(p);
console.log(p.x / 2 ** 4, p.y / 2 ** 4);
console.log(p.x * p.y);
console.log((p.x * p.y >> 4) / 2 ** 4);