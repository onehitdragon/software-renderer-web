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
    vW: 1,
    vH: 1
}
const camera = {
    distanceToViewport: 1
}

interface Vec2{
    x: number,
    y: number
}

interface Vec3 extends Vec2{
    z: number
}

interface Vec4 extends Vec3{
    w: number
}

interface Trigangle extends Vec3{
    color: string
}

type M3x3 = [[number, number, number], [number, number, number], [number, number, number]];

function arrayToVec3(arr: [number, number, number]): Vec3 {
    return { x: arr[0], y: arr[1], z: arr[2] };
}

function addVec3(vec1: Vec3, vec2: Vec3): Vec3{
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y,
        z: vec1.z + vec2.z
    }
}

function scalarVec3(vec3: Vec3, scalar: number){
    return {
        x: vec3.x * scalar,
        y: vec3.y * scalar,
        z: vec3.z * scalar
    }
}

function arrayToVec4(arr: [number, number, number, number]): Vec4 {
    return { x: arr[0], y: arr[1], z: arr[2], w: arr[3] };
}

function arrayToTrigangle(arr: [number, number, number, string]): Trigangle {
    return { x: arr[0], y: arr[1], z: arr[2], color: arr[3] };
}

function multi_M3x3AndVec3(m3x3: M3x3, vec3: Vec3): Vec3{
    return {
        x: m3x3[0][0]*vec3.x + m3x3[0][1]*vec3.y + m3x3[0][2]*vec3.z,
        y: m3x3[1][0]*vec3.x + m3x3[1][1]*vec3.y + m3x3[1][2]*vec3.z,
        z: m3x3[2][0]*vec3.x + m3x3[2][1]*vec3.y + m3x3[2][2]*vec3.z
    }
}

interface Model{
    name: string,
    vertices: Vec3[],
    trigangles: Trigangle[]
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
    trigangles: [
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
export { Vec2, Vec3, Vec4, Trigangle, M3x3 }
export { arrayToVec3, addVec3, scalarVec3, arrayToVec4, arrayToTrigangle, multi_M3x3AndVec3 }
export { Transform, Model, Instance, Scene, cubeModel }