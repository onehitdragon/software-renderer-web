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

export { Vec2, Vec3, Vec4 }
export { createVec3, addVec3, subVec3, scalarVec3, lengthVec3, dot }