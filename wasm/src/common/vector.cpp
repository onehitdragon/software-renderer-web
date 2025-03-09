#include "vector.h"
#include <cmath>

Vec2::Vec2(): x(0), y(0){}
Vec2::Vec2(float x, float y): x(x), y(y){}

Vec3::Vec3(): z(0){}
Vec3::Vec3(float x, float y, float z): Vec2(x, y), z(z){}

Vec4::Vec4(): w(0){}
Vec4::Vec4(float x, float y, float z, float w): Vec3(x, y, z), w(w){};

Vec3 addVec(const Vec3 &vec1, const Vec3 &vec2){
    return {
        vec1.x + vec2.x,
        vec1.y + vec2.y,
        vec1.z + vec2.z
    };
}
Vec3 subVec(const Vec3 &vec1, const Vec3 &vec2){
    return {
        vec1.x - vec2.x,
        vec1.y - vec2.y,
        vec1.z - vec2.z
    };
}
Vec2 subVec(const Vec2 &vec1, const Vec2 &vec2){
    return {
        vec1.x - vec2.x,
        vec1.y - vec2.y
    };
}
Vec3 scalarVec(const float &scalar, const Vec3 &vec){
    return {
        vec.x * scalar,
        vec.y * scalar,
        vec.z * scalar
    };
}
float scalarCrossVec(const Vec2 &vec1, const Vec2 &vec2){
    return (vec1.x * vec2.y) - (vec1.y * vec2.x);
}
float lengthVec(const Vec3 &vec){
    return std::sqrt(
        vec.x * vec.x +
        vec.y * vec.y +
        vec.z * vec.z
    );
}
float dot(const Vec3 &vec1, const Vec3 &vec2){
    return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
}
Vec3 homogeneous3DToCartesian(const Vec3 &vec3){
    return {
        vec3.x / vec3.z,
        vec3.y / vec3.z,
        vec3.z
    };
}
void swapVec(Vec3 &vec1, Vec3 &vec2){
    Vec3 temp = vec1;
    vec1 = vec2;
    vec2 = temp;
}