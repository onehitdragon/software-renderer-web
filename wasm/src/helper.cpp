#include "emscripten.h"
#include "emscripten/bind.h"
#include "global.h"
#include "common/matrix.h"
#include <cmath>
#include "common/plane.h"
#include "common/sphere.h"
#include "common/fixednumber.h"

Vec3 viewportToCanvasCoordinate(const Vec3 &vec3){
    return {
        vec3.x + canvas_half_cW,
        -vec3.y + canvas_half_cH,
        vec3.z
    };
}

void putPixel(const int &x, const int &y, const Vec4 &color){
    int offset = (x * 4) + (y * canvas_four_mul_cW);
    canvasBuffer[offset + 0] = color.x;
    canvasBuffer[offset + 1] = color.y;
    canvasBuffer[offset + 2] = color.z;
    canvasBuffer[offset + 3] = color.w;
}

void drawFilledTriangle(Vec3 p1, Vec3 p2, Vec3 p3, const Vec4 &color){
    p1 = viewportToCanvasCoordinate(p1);
    p2 = viewportToCanvasCoordinate(p2);
    p3 = viewportToCanvasCoordinate(p3);

    Vec2 p12 = subVec((Vec2)p2, (Vec2)p1);
    Vec2 p13 = subVec((Vec2)p3, (Vec2)p1);
    if(scalarCrossVec(p12, p13) > 0){
        swapVec(p2, p3);
    }

    Vec2Int p1F = fixedNumber_fixedXY(p1);
    Vec2Int p2F = fixedNumber_fixedXY(p2);
    Vec2Int p3F = fixedNumber_fixedXY(p3);
    int xMin = std::min(p1F.x, std::min(p2F.x, p3F.x)) >> fixedNumber_RESOLUTION;
    int yMin = std::min(p1F.y, std::min(p2F.y, p3F.y)) >> fixedNumber_RESOLUTION;
    int xMax = (std::max(p1F.x, std::max(p2F.x, p3F.x)) + 15) >> fixedNumber_RESOLUTION;
    int yMax = (std::max(p1F.y, std::max(p2F.y, p3F.y)) + 15) >> fixedNumber_RESOLUTION;
    int dx12 = p2F.x - p1F.x;
    int dx23 = p3F.x - p2F.x;
    int dx31 = p1F.x - p3F.x;
    int dy12 = p2F.y - p1F.y;
    int dy23 = p3F.y - p2F.y;
    int dy31 = p1F.y - p3F.y;
    int dx12F = dx12 << fixedNumber_RESOLUTION;
    int dx23F = dx23 << fixedNumber_RESOLUTION;
    int dx31F = dx31 << fixedNumber_RESOLUTION;
    int dy12F = dy12 << fixedNumber_RESOLUTION;
    int dy23F = dy23 << fixedNumber_RESOLUTION;
    int dy31F = dy31 << fixedNumber_RESOLUTION;
    int C1 = dy12 * p1F.x - dx12 * p1F.y;
    int C2 = dy23 * p2F.x - dx23 * p2F.y;
    int C3 = dy31 * p3F.x - dx31 * p3F.y;
    if(dy12 > 0 || (dy12 == 0 && dx12 < 0)){
        C1--;
    }
    if(dy23 > 0 || (dy23 == 0 && dx23 < 0)){
        C2--;
    }
    if(dy31 > 0 || (dy31 == 0 && dx31 < 0)){
        C3--;
    }

    int q = 8;
    xMin = xMin & ~(q - 1);
    yMin = yMin & ~(q - 1);

    for(int y = yMin; y < yMax; y += q){
        for(int x = xMin; x < xMax; x += q){
            int x0 = (x << fixedNumber_RESOLUTION) + 8;
            int y0 = (y << fixedNumber_RESOLUTION) + 8;
            int x1 = ((x + q - 1) << fixedNumber_RESOLUTION) + 8;
            int y1 = ((y + q - 1) << fixedNumber_RESOLUTION) + 8;

            bool _00_12 = C1 + dx12 * y0 - dy12 * x0 < 0;
            bool _10_12 = C1 + dx12 * y0 - dy12 * x1 < 0;
            bool _01_12 = C1 + dx12 * y1 - dy12 * x0 < 0;
            bool _11_12 = C1 + dx12 * y1 - dy12 * x1 < 0;

            bool _00_23 = C2 + dx23 * y0 - dy23 * x0 < 0;
            bool _10_23 = C2 + dx23 * y0 - dy23 * x1 < 0;
            bool _01_23 = C2 + dx23 * y1 - dy23 * x0 < 0;
            bool _11_23 = C2 + dx23 * y1 - dy23 * x1 < 0;

            bool _00_31 = C3 + dx31 * y0 - dy31 * x0 < 0;
            bool _10_31 = C3 + dx31 * y0 - dy31 * x1 < 0;
            bool _01_31 = C3 + dx31 * y1 - dy31 * x0 < 0;
            bool _11_31 = C3 + dx31 * y1 - dy31 * x1 < 0;

            int a = 
                _00_12 + _10_12 + _01_12 + _11_12 +
                _00_23 + _10_23 + _01_23 + _11_23 +
                _00_31 + _10_31 + _01_31 + _11_31;

            if(a == 0){
                continue; // ignore block
            }

            if(a == 12){
                // accept block
                for(int yi = y; yi < y + q; yi++){
                    for(int xi = x; xi < x + q; xi++){
                        putPixel(xi, yi, color);
                    }
                }
            }
            else{
                // partially block
                int cy12 = C1 + dx12 * y0 - dy12 * x0;
                int cy23 = C2 + dx23 * y0 - dy23 * x0;
                int cy31 = C3 + dx31 * y0 - dy31 * x0;
                for(int yi = y; yi < y + q; yi++){
                    int cx12 = cy12;
                    int cx23 = cy23;
                    int cx31 = cy31;
                    for(int xi = x; xi < x + q; xi++){
                        if(cx12 < 0 && cx23 < 0 && cx31 < 0){
                            putPixel(xi, yi, color);
                        }
                        cx12 -= dy12F;
                        cx23 -= dy23F;
                        cx31 -= dy31F;
                    }
                    cy12 += dx12F;
                    cy23 += dx23F;
                    cy31 += dx31F;
                }
            }
            
        }
    }
}

void renderTriangle(const Triangle &triangle, const std::vector<Vec3> &projecteds){
    drawFilledTriangle(
        projecteds[triangle.x],
        projecteds[triangle.y],
        projecteds[triangle.z],
        {0, 0, 0, 255}
    );
}

M4x4 makeModelTransform(const Transform &transform){
    M4x4 m_scale = {
        transform.scale, 0, 0, 0,
        0, transform.scale, 0, 0,
        0, 0, transform.scale, 0,
        0, 0, 0, 1
    };
    float rotationRad = transform.rotation * M_PI / 180;
    M4x4 m_rotation = {
        std::cos(rotationRad), 0, std::sin(rotationRad), 0,
        0, 1, 0, 0,
        -(std::sin(rotationRad)), 0, std::cos(rotationRad), 0,
        0, 0, 0, 1
    };
    M4x4 m_translation = {
        1, 0, 0, transform.translation.x,
        0, 1, 0, transform.translation.y,
        0, 0, 1, transform.translation.z,
        0, 0, 0, 1
    };

    return multi_matrix(multi_matrix(m_translation, m_rotation), m_scale);
}

M4x4 makeCameraTransform(){
    M4x4 m_translation = {
        1, 0, 0, -camera.transform.translation.x,
        0, 1, 0, -camera.transform.translation.y,
        0, 0, 1, -camera.transform.translation.z,
        0, 0, 0, 1
    };
    float rotationRad = -camera.transform.rotation * M_PI / 180;
    M4x4 m_rotation = {
        std::cos(rotationRad), 0, std::sin(rotationRad), 0,
        0, 1, 0, 0,
        -(std::sin(rotationRad)), 0, std::cos(rotationRad), 0,
        0, 0, 0, 1
    };

    return multi_matrix(m_rotation, m_translation);
}

unsigned int clippingPlaneLength = 5;
Plane *clippingPlanes = new Plane[clippingPlaneLength];
bool clippingPlanesInited = false;

void initClippingPlanes(){
    if(!clippingPlanesInited){
        // nearPlane
        clippingPlanes[0].normal = {0, 0, 1};
        clippingPlanes[0].D = -camera.distanceToViewport;
        //leftPlane
        clippingPlanes[1].normal = {1 / std::sqrt((float)2), 0, 1 / std::sqrt((float)2)};
        clippingPlanes[1].D = 0;
        //rightPlane
        clippingPlanes[2].normal = {-1 / std::sqrt((float)2), 0, 1 / std::sqrt((float)2)};
        clippingPlanes[2].D = 0;
        //bottomPlane
        clippingPlanes[3].normal = {0, 1 / std::sqrt((float)2), 1 / std::sqrt((float)2)};
        clippingPlanes[3].D = 0;
        //topPlane
        clippingPlanes[4].normal = {0, -1 / std::sqrt((float)2), 1 / std::sqrt((float)2)};
        clippingPlanes[4].D = 0;

        clippingPlanesInited = true;
    }
}

Sphere getBoudingSphere(const std::vector<Vec3> &verticies){
    Sphere result;

    for(int i = 0, n = verticies.size(); i < n; i++){
        Vec3 vertex = verticies[i];
        result.center.x += vertex.x;
        result.center.y += vertex.y;
        result.center.z += vertex.z;
    }
    result.center.x /= verticies.size();
    result.center.y /= verticies.size();
    result.center.z /= verticies.size();

    for(int i = 0, n = verticies.size(); i < n; i++){
        Vec3 vertex = verticies[i];
        float distanceVertexAndCenter = lengthVec(subVec(vertex, result.center));
        if(result.radius < distanceVertexAndCenter){
            result.radius = distanceVertexAndCenter;
        }
    }

    return result;
}

ClippingPlaneStatus clipWholeObject(const Sphere &boundingSphere){
    ClippingPlaneStatus status;

    for(int i = 0; i < clippingPlaneLength; i++){
        Plane plane = clippingPlanes[i];
        float d = distancePointToPlane(plane, boundingSphere.center);
        if(d < -(boundingSphere.radius)){
            status.rears.push_back(plane);
            break;
        }
        if(d > boundingSphere.radius){
            status.fronts.push_back(plane);
        }
        if(std::abs(d) < boundingSphere.radius){
            status.intersects.push_back(plane);
        }
    }

    return status;
}

std::vector<Triangle> clipTriangle(
    const std::vector<Plane> &intersectPlanes,
    std::vector<Vec3> &verticies,
    const std::vector<Triangle> &triangles
){
    std::vector<Triangle> trianglesWaitingProcess = triangles;
    std::vector<int> trianglesWaitingProcess_plane(trianglesWaitingProcess.size(), 0);
    std::vector<Triangle> trianglesProcessed;
    trianglesProcessed.reserve(trianglesWaitingProcess.size());
    
    while(!trianglesWaitingProcess.empty()){
        Triangle triangle = trianglesWaitingProcess.back();
        trianglesWaitingProcess.pop_back();
        int startPlane = trianglesWaitingProcess_plane.back();
        trianglesWaitingProcess_plane.pop_back();
        int front = 0;
        for(int i = startPlane, n = intersectPlanes.size(); i < n; i++){
            Plane plane = intersectPlanes[i];
            Vec3 vertexA = verticies[triangle.x];
            Vec3 vertexB = verticies[triangle.y];
            Vec3 vertexC = verticies[triangle.z];
            float dA = distancePointToPlane(plane, vertexA);
            float dB = distancePointToPlane(plane, vertexB);
            float dC = distancePointToPlane(plane, vertexC);

            if(dA < 0 && dB < 0 && dC < 0){
                break;
            }
            else if(dA >= 0 && dB >= 0 && dC >= 0){
                front++;
                continue;
            }
            else{
                if(oneVertexFront(plane, dA, dB, dC, vertexA, vertexB, vertexC, triangle, verticies, trianglesWaitingProcess, trianglesWaitingProcess_plane, i)){
                    break;
                }
                else if(twoVertexFront(plane, dA, dB, dC, vertexA, vertexB, vertexC, triangle, verticies, trianglesWaitingProcess, trianglesWaitingProcess_plane, i)){
                    break;
                }
            }
        }
        if(front == intersectPlanes.size() - startPlane){
            trianglesProcessed.push_back(triangle);
        }
    }

    return trianglesProcessed;
}

std::vector<Triangle> clipping(std::vector<Vec3> &applieds, const std::vector<Triangle> &triangles){
    initClippingPlanes();
    ClippingPlaneStatus status = clipWholeObject(getBoudingSphere(applieds));
    if(status.rears.size() > 0){
        return {};
    }
    if(status.fronts.size() == clippingPlaneLength){
        return triangles;
    }

    return clipTriangle(status.intersects, applieds, triangles);
}

std::vector<Vec3> apply(const Instance &instance){
    M4x4 m_Model = makeModelTransform(instance.transform);
    M4x4 m_Camera = makeCameraTransform();
    M4x4 m_CameraModel = multi_matrix(
        m_Camera,
        m_Model
    );

    std::vector<Vec3> applieds;
    applieds.reserve(instance.model->vertices.size());

    for(int i = 0, n = instance.model->vertices.size(); i < n; i++){
        Vec3 applied = matrix_to_vec3(
            multi_matrix(
                m_CameraModel,
                vec3_to_M4x1(instance.model->vertices[i])
            )
        );
        applieds.push_back(applied);
    }

    return applieds;
}

M3x4 makeProjectionTransform(){
    return {
        camera.distanceToViewport * canvas_cW / viewport_vW, 0, 0, 0,
        0, camera.distanceToViewport * canvas_cH / viewport_vH, 0, 0,
        0, 0, 1, 0
    };
}

void project(std::vector<Vec3> &applieds){
    M3x4 m_Projection = makeProjectionTransform();

    for(int i = 0, n = applieds.size(); i < n; i++){
        Vec3 applied = applieds[i];
        Vec3 projected = homogeneous3DToCartesian(
            matrix_to_vec3(
                multi_matrix(
                    m_Projection,
                    vec3_to_M4x1(applied)
                )
            )
        );
        applieds[i] = projected;
    }
}

void render_instance(const Instance &instance){
    std::vector<Vec3> applieds = apply(instance);

    std::vector<Triangle> clippingTriangles = clipping(applieds, instance.model->triangles);
    if(clippingTriangles.empty()) return;

    project(applieds);

    std::fill_n(canvasBuffer, canvasBufferLength, 0);
    for(int i = 0, n = clippingTriangles.size(); i < n; i++){
        Triangle triangle = clippingTriangles[i];
        renderTriangle(triangle, applieds);
    }
}

EMSCRIPTEN_BINDINGS(helper){
    emscripten::function("render_instance", &render_instance);
}
