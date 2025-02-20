import { Vec2, Vec3 } from "./common/vector";

const RESOLUTION = 4;
const MULTIPLIER = 2 ** RESOLUTION;

function fixedXY<T extends Vec2 | Vec3>(vec: T): T{
    return {
        ...vec,
        x: Math.round(vec.x * MULTIPLIER),
        y: Math.round(vec.y * MULTIPLIER)
    }
}

function floatXY<T extends Vec2 | Vec3>(vec: T): T{
    return {
        ...vec,
        x: vec.x / MULTIPLIER,
        y: vec.y / MULTIPLIER
    }
}

function float(num: number){
    return num / MULTIPLIER;
}

export { RESOLUTION, MULTIPLIER }
export { fixedXY, floatXY, float }