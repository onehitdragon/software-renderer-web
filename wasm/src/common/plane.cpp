#include "plane.h"

Plane::Plane(): D(0){}

float distancePointToPlane(const Plane &plane, const Vec3 &point){
    return dot(plane.normal, point) + plane.D;
}

ClippingPlaneStatus::ClippingPlaneStatus(){}

Vec3 getPointInLineAndThroughPlane(
    const Vec3 &pointA,
    const Vec3 &pointB,
    const Plane &plane
){
    Vec3 AB = subVec(pointB, pointA);
    float t = (-plane.D - dot(plane.normal, pointA)) / dot(plane.normal, AB);

    return addVec(pointA, scalarVec(t, AB));
}

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
){
    bool isOneVertexFront = false;
    Vec3 frontVertex, rearVertex1, rearVertex2;
    int frontIndex;
    if(dA >= 0 && dB < 0 && dC < 0){
        frontVertex = vertexA;
        rearVertex1 = vertexB;
        rearVertex2 = vertexC;
        frontIndex = triangle.x;
        isOneVertexFront = true;
    }
    if(dB >= 0 && dA < 0 && dC < 0){
        frontVertex = vertexB;
        rearVertex1 = vertexA;
        rearVertex2 = vertexC;
        frontIndex = triangle.y;
        isOneVertexFront = true;
    }
    if(dC >= 0 && dA < 0 && dB < 0){
        frontVertex = vertexC;
        rearVertex1 = vertexA;
        rearVertex2 = vertexB;
        frontIndex = triangle.z;
        isOneVertexFront = true;
    }
    if(!isOneVertexFront){
        return false;
    }

    Vec3 intersectVertex1 = getPointInLineAndThroughPlane(frontVertex, rearVertex1, plane);
    Vec3 intersectVertex2 = getPointInLineAndThroughPlane(frontVertex, rearVertex2, plane);
    verticies.push_back(intersectVertex1);
    int num_newVertex1 = verticies.size() - 1;
    verticies.push_back(intersectVertex2);
    int num_newVertex2 = verticies.size() - 1;
    Triangle newTriangle = {
        frontIndex,
        num_newVertex1,
        num_newVertex2,
        triangle.color
    };
    trianglesWaitingProcess.push_back(newTriangle);
    trianglesWaitingProcess_plane.push_back(i + 1);

    return true;
}

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
){
    bool isTwoVertexFront = false;
    Vec3 frontVertex1, frontVertex2, rearVertex;
    int frontIndex1, frontIndex2;
    if(dA >= 0 && dB >= 0 && dC < 0){
        frontVertex1 = vertexA;
        frontVertex2 = vertexB;
        rearVertex = vertexC;
        frontIndex1 = triangle.x;
        frontIndex2 = triangle.y;
        isTwoVertexFront = true;
    }
    if(dA >= 0 && dC >= 0 && dB < 0){
        frontVertex1 = vertexA;
        frontVertex2 = vertexC;
        rearVertex = vertexB;
        frontIndex1 = triangle.x;
        frontIndex2 = triangle.z;
        isTwoVertexFront = true;
    }
    if(dB >= 0 && dC >= 0 && dA < 0){
        frontVertex1 = vertexB;
        frontVertex2 = vertexC;
        rearVertex = vertexA;
        frontIndex1 = triangle.y;
        frontIndex2 = triangle.z;
        isTwoVertexFront = true;
    }
    if(!isTwoVertexFront){
        return false;
    }

    Vec3 intersectVertex1 = getPointInLineAndThroughPlane(frontVertex1, rearVertex, plane);
    Vec3 intersectVertex2 = getPointInLineAndThroughPlane(frontVertex2, rearVertex, plane);
    verticies.push_back(intersectVertex1);
    int num_newVertex1 = verticies.size() - 1;
    verticies.push_back(intersectVertex2);
    int num_newVertex2 = verticies.size() - 1;
    Triangle newTriangle1 = {
        frontIndex1,
        frontIndex2,
        num_newVertex1,
        triangle.color
    };
    Triangle newTriangle2 = {
        frontIndex2,
        num_newVertex1,
        num_newVertex2,
        triangle.color
    };
    trianglesWaitingProcess.push_back(newTriangle1);
    trianglesWaitingProcess_plane.push_back(i + 1);
    trianglesWaitingProcess.push_back(newTriangle2);
    trianglesWaitingProcess_plane.push_back(i + 1);

    return true;
}