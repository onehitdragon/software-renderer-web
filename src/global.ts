import { arrayToVec3, arrayToVec4 } from "./common/converter";
import { Vec3, Vec4, colorToVec4 } from "./common/vector";

const canvasElement = document.getElementById("canvas1") as HTMLCanvasElement | null;
if(canvasElement == null){
    throw "dont find canvas1";
}

const cW = parseInt(canvasElement.getAttribute("width")!);
const cH = parseInt(canvasElement.getAttribute("height")!);
const ctx = canvasElement.getContext("2d")!;
const ctxBuffer = ctx.getImageData(0, 0, cW, cH);
const depthBuffer = Array.from({ length: cW * cH }, () => Infinity);
const canvas = {
    cW,
    cH,
    half_cW: cW / 2,
    half_cH: cH / 2,
    four_mul_cW: 4 * cW
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

interface Triangle extends Vec3{
    color: Vec4
}

function arrayToTrigangle(arr: [number, number, number, Vec4]): Triangle {
    return { x: arr[0], y: arr[1], z: arr[2], color: arr[3] };
}

interface Model{
    name: Readonly<string>,
    vertices: readonly Readonly<Vec3>[],
    triangles: readonly Readonly<Triangle>[]
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

interface RenderStatus{
    totalTrig: number,
    geometryTime: number,
    rasterizationTime: number,
    totalTimeTake: number
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
        arrayToTrigangle([0, 1, 2, colorToVec4("red")]),
        arrayToTrigangle([0, 2, 3, colorToVec4("red")]),
        arrayToTrigangle([4, 0, 3, colorToVec4("green")]),
        arrayToTrigangle([4, 3, 7, colorToVec4("green")]),
        arrayToTrigangle([5, 4, 7, colorToVec4("blue")]),
        arrayToTrigangle([5, 7, 6, colorToVec4("blue")]),
        arrayToTrigangle([1, 5, 6, colorToVec4("yellow")]),
        arrayToTrigangle([1, 6, 2, colorToVec4("yellow")]),
        arrayToTrigangle([4, 5, 1, colorToVec4("purple")]),
        arrayToTrigangle([4, 1, 0, colorToVec4("purple")]),
        arrayToTrigangle([2, 6, 7, colorToVec4("cyan")]),
        arrayToTrigangle([2, 7, 3, colorToVec4("cyan")]),
    ]
};

export { ctx, ctxBuffer, depthBuffer }
export { canvas, viewport, camera }
export { Triangle }
export { arrayToTrigangle }
export { Transform, Model, Instance, Scene, cubeModel, RenderStatus }