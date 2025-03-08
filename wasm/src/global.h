#ifndef GLOBAL_H
#define GLOBAL_H

#include "common/vector.h"
#include "emscripten/bind.h"

class Triangle{
public:
    int x;
    int y;
    int z;
    Vec4 color;
    Triangle();
    Triangle(int x, int y, int z, Vec4 color);
};

class Model{
public:
    std::vector<Vec3> vertices;
    std::vector<Triangle> triangles;
    Model();
    Model(int num_vertices, int num_triangles);
};

class Transform{
public:
    Vec3 translation;
    float rotation;
    float scale;
    Transform();
    Transform(Vec3 translation, float rotation, float scale);
};

class Instance{
public:
    Model *model;
    Transform transform;
    Instance();
    Instance(Model *model);
};

class Camera{
public:
    float distanceToViewport;
    Transform transform;
    Camera();
    Camera(float distanceToViewport, Transform transform);
};
extern Camera camera;

#endif