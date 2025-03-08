#include "vector.h"

Vec2::Vec2(): x(0), y(0){}
Vec2::Vec2(float x, float y): x(x), y(y){}

Vec3::Vec3(): z(0){}
Vec3::Vec3(float x, float y, float z): Vec2(x, y), z(z){}

Vec4::Vec4(): w(0){}
Vec4::Vec4(float x, float y, float z, float w): Vec3(x, y, z), w(w){};