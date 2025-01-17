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

function scalarVec3(vec3: Vec3, scalar: number){
    return {
        x: vec3.x * scalar,
        y: vec3.y * scalar,
        z: vec3.z * scalar
    }
}

export { Vec2, Vec3, Vec4 }
export { addVec3, subVec3, scalarVec3 }