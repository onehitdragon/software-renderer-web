import { arrayToVec4 } from "./converter"

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

function createVec3(){
    return {
        x: 0,
        y: 0,
        z: 0
    }
}

function roundVec2(vec2: Vec2): Vec2{
    return {
        x: Math.round(vec2.x),
        y: Math.round(vec2.y)
    }
}

function subVec2(vec1: Vec2, vec2: Vec2): Vec2{
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y
    }
}

function roundVec3(vec3: Vec3): Vec3{
    return {
        x: Math.round(vec3.x),
        y: Math.round(vec3.y),
        z: Math.round(vec3.z)
    }
}

function roundXYVec3(vec3: Vec3): Vec3{
    return {
        x: Math.round(vec3.x),
        y: Math.round(vec3.y),
        z: vec3.z
    }
}

function addVec3(vec1: Vec3, vec2: Vec3): Vec3{
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y,
        z: vec1.z + vec2.z
    }
}

function subVec3(vec1: Vec3, vec2: Vec3): Vec3{
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y,
        z: vec1.z - vec2.z
    }
}

function scalarVec3(scalar: number, vec3: Vec3){
    return {
        x: vec3.x * scalar,
        y: vec3.y * scalar,
        z: vec3.z * scalar
    }
}

function lengthVec3(vec3: Vec3){
    return Math.sqrt(
        Math.pow(vec3.x, 2) +
        Math.pow(vec3.y, 2) +
        Math.pow(vec3.z, 2)
    );
}

function dot(vec1: Vec3, vec2: Vec3){
    return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
}

function scalarCrossVec2(vec1: Vec2, vec2: Vec2){
    return (vec1.x * vec2.y) - (vec1.y * vec2.x);
}

function colorToVec4(
    color: "red" | "green" | "blue" | "yellow" | "cyan" | "purple" | "white" | "black"
): Vec4{
    color = color.toLowerCase() as any;
    switch(color){
        case "red":
            return arrayToVec4([255, 0, 0, 255]);
        case "green":
            return arrayToVec4([0, 255, 0, 255]);
        case "blue":
            return arrayToVec4([0, 0, 255, 255]);
        case "yellow":
            return arrayToVec4([255, 255, 0, 255]);
        case "cyan":
            return arrayToVec4([0, 255, 255, 255]);
        case "purple":
            return arrayToVec4([128, 0, 128, 255]);
        case "black":
            return arrayToVec4([0, 0, 0, 255]);
        default:
            return arrayToVec4([255, 255, 255, 255])
    }
}

export { Vec2, Vec3, Vec4 }
export { createVec3, subVec2, addVec3, subVec3, scalarVec3, lengthVec3, dot, colorToVec4, roundVec2, roundVec3,
    scalarCrossVec2, roundXYVec3 }