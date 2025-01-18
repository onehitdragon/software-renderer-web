import { arrayToVec3 } from "./common/converter";
import { Vec3 } from "./common/vector";

const canvasElement = document.getElementById("canvas1") as HTMLCanvasElement | null;
if(canvasElement == null){
    throw "dont find canvas1";
}

const cW = canvasElement.getAttribute("width") as unknown as number;
const cH = canvasElement.getAttribute("height") as unknown as number;
const ctx = canvasElement.getContext("2d")!;
const canvas = {
    cW,
    cH
};
const viewport = {
    vW: 2,
    vH: 2
}
interface Camera{
    distanceToViewport: number,
    transform: {
        translation: Vec3
        rotation: number, // around y
    }
}
const camera: Camera = {
    distanceToViewport: 1,
    transform: {
        translation: { x: 0, y: 0, z: 0 },
        rotation: 0,
    }
}

interface Trigangle extends Vec3{
    color: string
}

function arrayToTrigangle(arr: [number, number, number, string]): Trigangle {
    return { x: arr[0], y: arr[1], z: arr[2], color: arr[3] };
}

interface Model{
    name: string,
    vertices: Vec3[],
    triangles: Trigangle[]
}

interface Transform{
    scale: number,
    rotation: number, // around y
    translation: Vec3
}

interface Instance{
    model: Model,
    transform: Transform
}

interface Scene{
    instances: Instance[]
}

const cubeModel: Model = {
    name: "cube",
    vertices:  [
        arrayToVec3([1, 1, 1]),
        arrayToVec3([-1, 1, 1]),
        arrayToVec3([-1, -1, 1]),
        arrayToVec3([1, -1, 1]),
        arrayToVec3([1, 1, -1]),
        arrayToVec3([-1, 1, -1]),
        arrayToVec3([-1, -1, -1]),
        arrayToVec3([1, -1, -1])
    ],
    triangles: [
        arrayToTrigangle([0, 1, 2, "red"]),
        arrayToTrigangle([0, 2, 3, "red"]),
        arrayToTrigangle([4, 0, 3, "green"]),
        arrayToTrigangle([4, 3, 7, "green"]),
        arrayToTrigangle([5, 4, 7, "blue"]),
        arrayToTrigangle([5, 7, 6, "blue"]),
        arrayToTrigangle([1, 5, 6, "yellow"]),
        arrayToTrigangle([1, 6, 2, "yellow"]),
        arrayToTrigangle([4, 5, 1, "purple"]),
        arrayToTrigangle([4, 1, 0, "purple"]),
        arrayToTrigangle([2, 6, 7, "cyan"]),
        arrayToTrigangle([2, 7, 3, "cyan"]),
    ]
};

export { ctx }
export { canvas, viewport, camera }
export { Trigangle }
export { arrayToTrigangle }
export { Transform, Model, Instance, Scene, cubeModel }