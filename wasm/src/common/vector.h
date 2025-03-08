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

#endif