#ifndef Sphere_H
#define Sphere_H

#include "vector.h"

class Sphere{
public:
    Vec3 center;
    float radius;
    Sphere();
    Sphere(Vec3 center, float radius);
};

#endif