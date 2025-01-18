import { Vec3 } from "./common/vector";
import { Scene, canvas, ctx, cubeModel } from "./global";
import { renderScene } from "./helper";
import * as dat from "dat.gui";

const gui = new dat.GUI({name: 'My GUI'});
const folder_Transform = gui.addFolder('Transform');
const folder_Scale = folder_Transform.addFolder('Scale');
const folder_Rotation = folder_Transform.addFolder('Rotation');
const folder_Translation = folder_Transform.addFolder('Translation');
folder_Transform.open();
folder_Scale.open();
folder_Rotation.open();
folder_Translation.open();
const scaleGui = {
    scale: 1,
}
const rotationGui = {
    rotation: 0
}
const translationGui: Vec3 = { x: 0, y: 0, z: 5 };
folder_Scale.add(scaleGui, "scale", 0, 3);
folder_Rotation.add(rotationGui, "rotation", 0, 360);
folder_Translation.add(translationGui, "x", -10, 10);
folder_Translation.add(translationGui, "y", -10, 10);
folder_Translation.add(translationGui, "z", -10, 10);

function Main(){
    ctx.clearRect(0, 0, canvas.cW, canvas.cH);

    const scene: Scene = {
        instances: []
    };
    scene.instances.push({
        model: cubeModel,
        transform: {
            scale: scaleGui.scale,
            rotation: rotationGui.rotation,
            translation: translationGui
        }
    });
    renderScene(scene);
}

Main();
folder_Scale.__controllers.forEach((controller) => {
    controller.onChange(Main);
});
folder_Rotation.__controllers.forEach((controller) => {
    controller.onChange(Main);
});
folder_Translation.__controllers.forEach((controller) => {
    controller.onChange(Main);
});
