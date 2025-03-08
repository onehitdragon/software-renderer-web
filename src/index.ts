import { Vec3 } from "./common/vector";
import { Model, Scene, Transform, canvas, ctx, cubeModel } from "./global";
import * as gui from "./gui";
import { renderScene } from "./helper";
import dsPath from "../assets/Teapot.3ds";
import { loadModelAtPath } from "./3dsModelLoader";
import * as fixedNumber from "./fixedNumber";
import createModule from "../wasm/out/test";

const runBtn = document.querySelector("button#run")! as HTMLButtonElement;
const aLink = document.querySelector("a#download")! as HTMLAnchorElement;
const runText = document.querySelector("span#runText")!;
const runContent = document.querySelector("div#runContent")!;

async function Main(){
    // wasm
    const wasmModule = await createModule();
    console.log(wasmModule);

    // Prepare scene
    const scene: Scene = {
        instances: [
            // {
            //     model: cubeModel,
            //     transform: {
            //         scale: 2,
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

    const loadedModel = await loadModelAtPath(dsPath);
    const loadedModelTransform = {
        scale: 0.04,
        rotation: 0,
        translation: { x: 0, y: 0, z: 4.5 }
    };
    scene.instances.push(
        {
            model: loadedModel,
            transform: loadedModelTransform
        },
    );
    const loadedModelWasm = createInstanceWasm(wasmModule, loadedModel, loadedModelTransform);
    console.log(loadedModel);
    console.log(loadedModelWasm);
    runBtn.onclick = () => {
        const applieds = wasmModule["apply"](loadedModelWasm);
        console.log(applieds);
        applieds.delete();
        console.log(new wasmModule["Vec3"]());
        // console.log(applieds.size());
        // console.log(applieds.get(0));
    }

    // UI
    for(const instance of scene.instances){
        gui.addIntanceGui(instance);
    }
    const [updateMonitor, renderStatus] = gui.showMonitor();

    // Loop
    function Loop(){
        // const start = performance.now(); //
        // const applieds = wasmModule["apply"](loadedModelWasm);
        // applieds.delete();
        // const geometryTime = performance.now() - start; //
        // renderStatus.geometryTime = geometryTime;

        //scene.instances[0].transform.rotation += 0.5;
        renderScene(scene, renderStatus);
        updateMonitor();

        requestAnimationFrame(Loop);
    }
    requestAnimationFrame(Loop);
}

Main();

function showMemory(wasmModule: any){
    let s = "";
    let buffer = wasmModule.HEAP8 as Int8Array;
    for(let i = 0; i < 200000; i++){
        s += `${buffer[i].toString(16)}(${i}) `;
    }
    document.querySelector("#sample")!.textContent = s;
}

function downloadMemory(wasmModule: any){
    const buffer = wasmModule.HEAP8 as Int8Array;
    const blob = new Blob([buffer.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = url;
    a.download = 'wasmMemory.bin';
    a.click();
    URL.revokeObjectURL(url);
}

function createInstanceWasm(wasmModule: any, model: Model, transform: Transform){
    const modelWasm = new wasmModule["Model"](model.vertices.length, model.triangles.length);
    for(let i = 0; i < model.vertices.length; i++){
        const vertexIn = model.vertices[i];
        const vec3 = new wasmModule["Vec3"](vertexIn.x, vertexIn.y, vertexIn.z);
        modelWasm.vertices.push_back(vec3);
        vec3.delete();
    }
    for(let i = 0; i < model.triangles.length; i++){
        const triangleIn = model.triangles[i];
        const color = new wasmModule["Vec4"](triangleIn.color.x, triangleIn.color.y, triangleIn.color.z, triangleIn.color.w);
        const triangle = new wasmModule["Triangle"](triangleIn.x, triangleIn.y, triangleIn.z, color);
        color.delete();
        modelWasm.triangles.push_back(triangle);
        triangle.delete();
    }

    const instanceWasm = new wasmModule["Instance"](modelWasm);
    instanceWasm.transform.translation.x = transform.translation.x;
    instanceWasm.transform.translation.y = transform.translation.y;
    instanceWasm.transform.translation.z = transform.translation.z;
    instanceWasm.transform.rotation = transform.rotation;
    instanceWasm.transform.scale = transform.scale;
    
    // modelWasm.delete();
    // instanceWasm.delete();
    return instanceWasm;
}
