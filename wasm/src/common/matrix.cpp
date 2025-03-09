#include "matrix.h"
#include "emscripten.h"
#include "emscripten/bind.h"

M3x1::M3x1(): value{}{}
int M3x1::getM() const{ return 3; }
int M3x1::getN() const{ return 1; }

M4x1::M4x1(): value{}{}
M4x1::M4x1(
    float v00,
    float v10,
    float v20,
    float v30
){
    value[0][0] = v00;
    value[1][0] = v10;
    value[2][0] = v20;
    value[3][0] = v30;
}
int M4x1::getM() const{ return 4; }
int M4x1::getN() const{ return 1; }

M3x3::M3x3(): value{}{}
int M3x3::getM() const{ return 3; }
int M3x3::getN() const{ return 3; }

M4x4::M4x4(): value{}{}
M4x4::M4x4(
    float v00, float v01, float v02, float v03,
    float v10, float v11, float v12, float v13,
    float v20, float v21, float v22, float v23,
    float v30, float v31, float v32, float v33
){
    value[0][0] = v00;
    value[0][1] = v01;
    value[0][2] = v02;
    value[0][3] = v03;

    value[1][0] = v10;
    value[1][1] = v11;
    value[1][2] = v12;
    value[1][3] = v13;
    
    value[2][0] = v20;
    value[2][1] = v21;
    value[2][2] = v22;
    value[2][3] = v23;

    value[3][0] = v30;
    value[3][1] = v31;
    value[3][2] = v32;
    value[3][3] = v33;
}
int M4x4::getM() const{ return 4; }
int M4x4::getN() const{ return 4; }

M3x4::M3x4(): value{}{}
M3x4::M3x4(
    float v00, float v01, float v02, float v03,
    float v10, float v11, float v12, float v13,
    float v20, float v21, float v22, float v23
){
    value[0][0] = v00;
    value[0][1] = v01;
    value[0][2] = v02;
    value[0][3] = v03;

    value[1][0] = v10;
    value[1][1] = v11;
    value[1][2] = v12;
    value[1][3] = v13;
    
    value[2][0] = v20;
    value[2][1] = v21;
    value[2][2] = v22;
    value[2][3] = v23;
}
int M3x4::getM() const{ return 3; }
int M3x4::getN() const{ return 4; }

M4x4 multi_matrix(const M4x4 &matrix_a, const M4x4 &matrix_b){
    M4x4 result;
    for(int i = 0; i < matrix_a.getM(); i++){
        for(int j = 0; j < matrix_b.getN(); j++){
            for(int k = 0; k < matrix_a.getN(); k++){
                result.value[i][j] += matrix_a.value[i][k] *  matrix_b.value[k][j];
            }
        }
    }
    
    return result;
}

M4x1 multi_matrix(const M4x4 &matrix_a, const M4x1 &matrix_b){
    M4x1 result;
    for(int i = 0; i < matrix_a.getM(); i++){
        for(int j = 0; j < matrix_b.getN(); j++){
            for(int k = 0; k < matrix_a.getN(); k++){
                result.value[i][j] += matrix_a.value[i][k] *  matrix_b.value[k][j];
            }
        }
    }
    
    return result;
}

M3x1 multi_matrix(const M3x4 &matrix_a, const M4x1 &matrix_b){
    M3x1 result;
    for(int i = 0; i < matrix_a.getM(); i++){
        for(int j = 0; j < matrix_b.getN(); j++){
            for(int k = 0; k < matrix_a.getN(); k++){
                result.value[i][j] += matrix_a.value[i][k] *  matrix_b.value[k][j];
            }
        }
    }
    
    return result;
}

M4x1 vec3_to_M4x1(const Vec3 &vec3){
    M4x1 result = {
        vec3.x,
        vec3.y,
        vec3.z,
        1
    };

    return result;
}

Vec3 matrix_to_vec3(const M4x1 &m4x1){
    Vec3 result = {
        m4x1.value[0][0],
        m4x1.value[1][0],
        m4x1.value[2][0]
    };

    return result;
}

Vec3 matrix_to_vec3(const M3x1 &m3x1){
    Vec3 result = {
        m3x1.value[0][0],
        m3x1.value[1][0],
        m3x1.value[2][0]
    };

    return result;
}