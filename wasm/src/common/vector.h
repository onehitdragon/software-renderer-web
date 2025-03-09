#ifndef VECTOR_H
#define VECTOR_H

class Vec2{
public:
    float x;
    float y;
    Vec2();
    Vec2(float x, float y);
};

class Vec3: public Vec2{
public:
    float z;
    Vec3();
    Vec3(float x, float y, float z);
};

class Vec4: public Vec3{
public:
    float w;
    Vec4();
    Vec4(float x, float y, float z, float w);
};

Vec3 addVec(const Vec3 &vec1, const Vec3 &vec2);
Vec3 subVec(const Vec3 &vec1, const Vec3 &vec2);
Vec2 subVec(const Vec2 &vec1, const Vec2 &vec2);
Vec3 scalarVec(const float &scalar, const Vec3 &vec);
float scalarCrossVec(const Vec2 &vec1, const Vec2 &vec2);
float lengthVec(const Vec3 &vec);
float dot(const Vec3 &vec1, const Vec3 &vec2);
Vec3 homogeneous3DToCartesian(const Vec3 &vec3);
void swapVec(Vec3 &vec1, Vec3 &vec2);

#endif