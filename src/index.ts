import { Vec3 } from "./common/vector";
import { Scene, canvas, ctx, cubeModel } from "./global";
import { addIntanceGui, pane } from "./gui";
import { renderScene } from "./helper";

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
        {
            model: cubeModel,
            transform: {
                scale: 1,
                rotation: 0,
                translation: { x: 1, y: 2, z: 4.5 }
            }
        }
    ]
};

for(const instance of scene.instances){
    addIntanceGui(instance);
}

pane.on("change", () => {
    Main();
});



function Main(){
    ctx.clearRect(0, 0, canvas.cW, canvas.cH);
    console.clear();
    renderScene(scene);
}
Main();