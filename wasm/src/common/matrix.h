#ifndef MATRIX_H
#define MATRIX_H

#include "vector.h"

class Matrix{
public:
    virtual int getM() const = 0;
    virtual int getN() const = 0;
};

class M3x1: public Matrix{
public:
    float value[3][1];
    M3x1();
    int getM() const override;
    int getN() const override;
};

class M4x1: public Matrix{
public:
    float value[4][1];
    M4x1();
    M4x1(
        float v00,
        float v10,
        float v20,
        float v30
    );
    int getM() const override;
    int getN() const override;
};

class M3x3: public Matrix{
public:
    float value[3][3];
    M3x3();
    int getM() const override;
    int getN() const override;
};

class M4x4: public Matrix{
public:
    float value[4][4];
    M4x4();
    M4x4(
        float v00, float v01, float v02, float v03,
        float v10, float v11, float v12, float v13,
        float v20, float v21, float v22, float v23,
        float v30, float v31, float v32, float v33
    );
    int getM() const override;
    int getN() const override;
};

class M3x4: public Matrix{
public:
    float value[3][4];
    M3x4();
    M3x4(
        float v00, float v01, float v02, float v03,
        float v10, float v11, float v12, float v13,
        float v20, float v21, float v22, float v23
    );
    int getM() const override;
    int getN() const override;
};

M4x4 multi_matrix(const M4x4 &matrix_a, const M4x4 &matrix_b);
M4x1 multi_matrix(const M4x4 &matrix_a, const M4x1 &matrix_b);
M3x1 multi_matrix(const M3x4 &matrix_a, const M4x1 &matrix_b);
M4x1 vec3_to_M4x1(const Vec3 &vec3);
Vec3 matrix_to_vec3(const M4x1 &m4x1);
Vec3 matrix_to_vec3(const M3x1 &m3x1);

#endif