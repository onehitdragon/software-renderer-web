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

extern unsigned int canvas_cW;
extern unsigned int canvas_cH;
extern float canvas_half_cW;
extern float canvas_half_cH;
extern unsigned int canvas_four_mul_cW;
extern unsigned char *canvasBuffer;
extern size_t canvasBufferLength;
extern float viewport_vW;
extern float viewport_vH;

#endif