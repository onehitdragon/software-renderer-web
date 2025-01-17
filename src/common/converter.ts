import { M3x1, M4x1 } from "./matrix";
import { Vec2, Vec3, Vec4 } from "./vector";

function arrayToVec3(arr: [number, number, number]): Vec3 {
    return { x: arr[0], y: arr[1], z: arr[2] };
}

function arrayToVec4(arr: [number, number, number, number]): Vec4 {
    return { x: arr[0], y: arr[1], z: arr[2], w: arr[3] };
}

function vec3ToVec4(vec3: Vec3, w: number): Vec4{
    return {
        ...vec3,
        w
    }
}

function vec3ToM3x1(vec3: Vec3): M3x1{
    return [
        [vec3.x],
        [vec3.y],
        [vec3.z],
    ];
};

function vec4ToM4x1(vec4: Vec4): M4x1{
    return [
        [vec4.x],
        [vec4.y],
        [vec4.z],
        [vec4.w]
    ];
};

function m3x1ToVec3(m3x1: M3x1): Vec3{
    return {
        x: m3x1[0][0],
        y: m3x1[1][0],
        z: m3x1[2][0]
    };
};

function m4x1ToVec4(m4x1: M4x1): Vec4{
    return {
        x: m4x1[0][0],
        y: m4x1[1][0],
        z: m4x1[2][0],
        w: m4x1[3][0]
    };
};

function homogeneous4DToCartesian3D(vec4: Vec4): Vec3{
    return {
        x: vec4.x / vec4.w,
        y: vec4.y / vec4.w,
        z: vec4.z / vec4.w,
    }
}

function homogeneous3DToCartesian2D(vec3: Vec3): Vec2{
    return {
        x: vec3.x / vec3.z,
        y: vec3.y / vec3.z,
    }
}

export { arrayToVec3, arrayToVec4, vec3ToM3x1, vec4ToM4x1, m3x1ToVec3,
    m4x1ToVec4, homogeneous4DToCartesian3D, homogeneous3DToCartesian2D, vec3ToVec4 }