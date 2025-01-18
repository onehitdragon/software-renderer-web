import { m3x1ToVec3, m4x1ToVec4, vec3ToM3x1, vec4ToM4x1 } from "./converter";
import { Vec3, Vec4 } from "./vector";

type M3x1 = [
    [number],
    [number],
    [number]
]

type M4x1 = [
    [number],
    [number],
    [number],
    [number]
]

type M3x3 = [
    [number, number, number],
    [number, number, number],
    [number, number, number]
];

type M4x4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
];

type M3x4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
];

type Matrix = M3x1 | M4x1 | M3x3 | M4x4 | M3x4;

function numberOfMxN(m: Matrix){
    return [m.length, m[0].length];
}

function multi_matrix(matrix_a: Matrix, matrix_b: Matrix): unknown{
    const [matrix_a_m, matrix_a_n] = numberOfMxN(matrix_a);
    const [matrix_b_m, matrix_b_n] = numberOfMxN(matrix_b);
    if(matrix_a_n != matrix_b_m){
        throw "cant multiple matrix"
    }

    const result = Array.from({ length: matrix_a_m }, () => Array(matrix_b_n).fill(0));
    for(let i = 0; i < matrix_a_m; i++){
        for(let j = 0; j < matrix_b_n; j++){
            for(let k = 0; k < matrix_a_n; k++){
                result[i][j] += matrix_a[i][k] *  matrix_b[k][j];
            }
        }
    }

    return result;
}

function multi_M3x3AndVec3(m3x3: M3x3, vec3: Vec3): Vec3{
    return m3x1ToVec3(multi_matrix(m3x3, vec3ToM3x1(vec3)) as M3x1);
}

function multi_M4x4AndM4x4(m4x4_a: M4x4, m4x4_b: M4x4): M4x4{
    return multi_matrix(m4x4_a, m4x4_b) as M4x4;
}

function multi_M4x4AndVec4(m4x4: M4x4, vec4: Vec4): Vec4{
    return m4x1ToVec4(multi_matrix(m4x4, vec4ToM4x1(vec4)) as M4x1);
}

export { Matrix, M3x1, M4x1, M3x3, M4x4, M3x4 }
export { multi_matrix, multi_M3x3AndVec3, multi_M4x4AndVec4, multi_M4x4AndM4x4 }