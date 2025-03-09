#ifndef PLANE_H
#define PLANE_H

#include <vector>
#include "vector.h"
#include "../global.h"

class Plane{
public:
    Vec3 normal;
    float D;
    Plane();
};

float distancePointToPlane(const Plane &plane, const Vec3 &point);

class ClippingPlaneStatus{
public:
    std::vector<Plane> fronts;
    std::vector<Plane> rears;
    std::vector<Plane> intersects;
    ClippingPlaneStatus();
};

bool oneVertexFront(
    const Plane &plane,
    const float &dA,
    const float &dB,
    const float &dC,
    const Vec3 &vertexA,
    const Vec3 &vertexB,
    const Vec3 &vertexC,
    const Triangle &triangle,
    std::vector<Vec3> &verticies,
    std::vector<Triangle> &trianglesWaitingProcess,
    std::vector<int> &trianglesWaitingProcess_plane,
    const int &i
);
bool twoVertexFront(
    const Plane &plane,
    const float &dA,
    const float &dB,
    const float &dC,
    const Vec3 &vertexA,
    const Vec3 &vertexB,
    const Vec3 &vertexC,
    const Triangle &triangle,
    std::vector<Vec3> &verticies,
    std::vector<Triangle> &trianglesWaitingProcess,
    std::vector<int> &trianglesWaitingProcess_plane,
    const int &i
);

#endif