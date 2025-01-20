import { homogeneous3DToCartesian, m3x1ToVec3, m4x1ToVec3, m4x1ToVec4, vec3ToVec4, vec4ToM4x1 } from "./common/converter";
import { M3x1, M3x3, M3x4, M4x1, M4x4, Matrix, multi_M3x3AndVec3, multi_M4x4AndVec4, multi_matrix } from "./common/matrix";
import { Plane, distancePointToPlane } from "./common/plane";
import { Vec2, Vec3, Vec4, addVec3, createVec3, dot, lengthVec3, scalarVec3, subVec3 } from "./common/vector";
import { canvas, viewport, ctx, camera, Triangle, Instance, Scene, Transform, ctxBuffer, RenderStatus, depthBuffer} from "./global";

function putPixelZ(x: number, y: number, z: number, color: Vec4){
    x = (x | 0) + canvas.half_cW;
    y = -(y | 0) + canvas.half_cH;

    if(x < 0 || x >= canvas.cW || y < 0 || y >= canvas.cH){
        return;
    }

    if(z > depthBuffer[x + y * canvas.cW]){
        return;
    }
    else{
        depthBuffer[x + y * canvas.cW] = z;
    }

    let offset = (x * 4) + (y * canvas.four_mul_cW);

    ctxBuffer.data[offset] = color.x;
    ctxBuffer.data[offset + 1] = color.y;
    ctxBuffer.data[offset + 2] = color.z;
    ctxBuffer.data[offset + 3] = color.w;
}

function putPixel(x: number, y: number, color: Vec4){
    x = (x | 0) + canvas.half_cW;
    y = -(y | 0) + canvas.half_cH;

    if(x < 0 || x >= canvas.cW || y < 0 || y >= canvas.cH){
        return;
    }

    let offset = (x * 4) + (y * canvas.four_mul_cW);

    ctxBuffer.data[offset] = color.x;
    ctxBuffer.data[++offset] = color.y;
    ctxBuffer.data[++offset] = color.z;
    ctxBuffer.data[++offset] = color.w;
}

// function putPixel(x: number, y: number, color: CanvasFillStrokeStyles["fillStyle"]){
//     x = (x | 0) + canvas.cW / 2;
//     y = -(y | 0) + canvas.cW / 2;

//     ctx.fillStyle = color;
//     ctx.fillRect(x, y, 1, 1);
// }

function swap<T1, T2>(vec1: T1, vec2: T2){
    return [vec2, vec1] as const;
}

function interpolate(i0: number, d0: number, i1: number, d1: number){
    if(i0 == i1){
        return [d0];
    }

    const values: number[] = [];
    const a = (d1 - d0) / (i1 - i0);
    let d = d0;

    for(let i = i0; i <= i1; i++){
        values.push(d);
        d = d + a;
    }

    return values;
}

function drawLine(start: Vec2, end: Vec2, color: Vec4){
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    if(dx >= dy){
        if(start.x > end.x){
            [start, end] = swap(start, end);
        }
        const ys = interpolate(start.x, start.y, end.x, end.y);
        for(let x = start.x; x <= end.x; x++){
            putPixel(x, ys[Math.ceil(x - start.x)], color);
        }
    }
    else{
        if(start.y > end.y){
            [start, end] = swap(start, end);
        }
        const xs = interpolate(start.y, start.x, end.y, end.x);
        for(let y = start.y; y <= end.y; y++){
            putPixel(xs[Math.ceil(y - start.y)], y, color);
        }
    }
}

function viewportToCanvas(vPoint: Vec2): Vec2{
    return {
        x: vPoint.x * canvas.cW / viewport.vW,
        y: vPoint.y * canvas.cH / viewport.vH
    }
}

function projectVertex(v: Vec3): Vec2{
    return viewportToCanvas({
        x: v.x * camera.distanceToViewport / v.z,
        y: v.y * camera.distanceToViewport / v.z
    });
}

function drawTriangle(p1: Vec3, p2: Vec3, p3: Vec3, color: Vec4){
    drawLine(p1, p2, color);
    drawLine(p2, p3, color);
    drawLine(p3, p1, color);
}

function drawFilledTriangle(p1: Vec3, p2: Vec3, p3: Vec3, color: Vec4){
    if(p1.y > p2.y){
        [p1, p2] = swap(p1, p2);
    }
    if(p1.y > p3.y){
        [p1, p3] = swap(p1, p3);
    }
    if(p2.y > p3.y){
        [p2, p3] = swap(p2, p3);
    }

    let x13 = interpolate(p1.y, p1.x, p3.y, p3.x);
    const x12 = interpolate(p1.y, p1.x, p2.y, p2.x);
    const x23 = interpolate(p2.y, p2.x, p3.y, p3.x);
    let x123 = [...x12, ...x23];

    let z13 = interpolate(p1.y, p1.z, p3.y, p3.z);
    const z12 = interpolate(p1.y, p1.z, p2.y, p2.z);
    const z23 = interpolate(p2.y, p2.z, p3.y, p3.z);
    let z123 = [...z12, ...z23];

    x12.pop();
    z12.pop();
    if(x13[Math.floor(x13.length / 2)] > x123[Math.floor(x123.length / 2)]){
        [x13, x123] = [x123, x13];
        [z13, z123] = [z123, z13];
    }

    for(let y = p1.y; y <= p3.y; y++){
        const index = Math.ceil(y - p1.y);
        const xLeft = x13[index];
        const xRight = x123[index];
        const zLeft = z13[index];
        const zRight = z123[index];
        const zs = interpolate(xLeft, zLeft, xRight, zRight);
        for(let x = xLeft; x <= xRight; x++){
            putPixelZ(x, y, zs[Math.ceil(x - xLeft)], color);
        }
    }
}

function renderTriangle(trigangle: Triangle, projecteds: Vec3[]){
    drawFilledTriangle(
        projecteds[trigangle.x],
        projecteds[trigangle.y],
        projecteds[trigangle.z],
        trigangle.color
    );
}

function makeModelTransform(transform: Transform): M4x4{
    const m_scale: M4x4 = [
        [transform.scale, 0, 0, 0],
        [0, transform.scale, 0, 0],
        [0, 0, transform.scale, 0],
        [0, 0, 0, 1]
    ];
    const rotationRad = transform.rotation * Math.PI / 180;
    const m_rotation: M4x4 = [
        [Math.cos(rotationRad), 0, Math.sin(rotationRad), 0],
        [0, 1, 0, 0],
        [-Math.sin(rotationRad), 0, Math.cos(rotationRad), 0],
        [0, 0, 0, 1]
    ];
    const m_translation: M4x4 = [
        [1, 0, 0, transform.translation.x],
        [0, 1, 0, transform.translation.y],
        [0, 0, 1, transform.translation.z],
        [0, 0, 0, 1]
    ];

    return multi_matrix(multi_matrix(m_translation, m_rotation) as M4x4, m_scale) as M4x4;
}

function makeCameraTransform(): M4x4{
    const m_translation: M4x4 = [
        [1, 0, 0, -camera.transform.translation.x],
        [0, 1, 0, -camera.transform.translation.y],
        [0, 0, 1, -camera.transform.translation.z],
        [0, 0, 0, 1]
    ];
    const rotationRad = -camera.transform.rotation * Math.PI / 180;
    const m_rotation: M4x4 = [
        [Math.cos(rotationRad), 0, Math.sin(rotationRad), 0],
        [0, 1, 0, 0],
        [-Math.sin(rotationRad), 0, Math.cos(rotationRad), 0],
        [0, 0, 0, 1]
    ];

    return multi_matrix(m_rotation, m_translation) as M4x4;
}

function makeProjectionTransform(): M3x4{
    return [
        [camera.distanceToViewport * canvas.cW / viewport.vW, 0, 0, 0],
        [0, camera.distanceToViewport * canvas.cH / viewport.vH, 0, 0],
        [0, 0, 1, 0]
    ]
}

function apply(vertex: Readonly<Vec3>, transform: Transform): Vec3{
    const m_Model = makeModelTransform(transform);
    const m_Camera = makeCameraTransform();

    return m4x1ToVec3(
        multi_matrix(
            multi_matrix(
                m_Camera,
                m_Model
            ) as M4x4,
            vec4ToM4x1(vec3ToVec4(vertex, 1))
        ) as M4x1
    );
}

// function apply(vertex: Vec3, transform: Transform): Vec2{
//     const m_Model = makeModelTransform(transform);
//     const m_Camera = makeCameraTransform();
//     const m_Projection = makeProjectionTransform();

//     return homogeneous3DToCartesian2D(
//         m3x1ToVec3(
//             multi_matrix(
//                 multi_matrix(
//                     multi_matrix(
//                         m_Projection,
//                         m_Camera
//                     ) as M3x4,
//                     m_Model
//                 ) as M3x4,
//                 vec4ToM4x1(vec3ToVec4(vertex, 1))
//             ) as M3x1
//         )
//     );
// }

function getBoudingSphere(verticies: Vec3[]): [Vec3, number]{
    let centerSphere: Vec3 = { x: 0, y: 0, z: 0 };
    let rSphere = 0;
    for(const vertex of verticies){
        centerSphere.x += vertex.x;
        centerSphere.y += vertex.y;
        centerSphere.z += vertex.z;
    }
    centerSphere.x /= verticies.length;
    centerSphere.y /= verticies.length;
    centerSphere.z /= verticies.length;
    for(const vertex of verticies){
        const distanceVertexAndCenter = lengthVec3(subVec3(vertex, centerSphere));
        if(rSphere < distanceVertexAndCenter){
            rSphere = distanceVertexAndCenter;
        }
    }

    return [centerSphere, rSphere];
}

function getClippingPlanes(){
    const nearPlane: Plane = {
        normal: { x: 0, y: 0, z: 1 },
        D: -camera.distanceToViewport
    };
    const leftPlane: Plane = {
        normal: { x: 1 / Math.sqrt(2), y: 0, z: 1 / Math.sqrt(2) },
        D: 0
    };
    const rightPlane: Plane = {
        normal: { x: -1 / Math.sqrt(2), y: 0, z: 1 / Math.sqrt(2) },
        D: 0
    };
    const bottomPlane: Plane = {
        normal: { x: 0, y: 1 / Math.sqrt(2), z: 1 / Math.sqrt(2) },
        D: 0
    };
    const topPlane: Plane = {
        normal: { x: 0, y: -1 / Math.sqrt(2), z: 1 / Math.sqrt(2) },
        D: 0
    };

    return [nearPlane, leftPlane, rightPlane, bottomPlane, topPlane];
}

function clipWholeObject(clippingPlanes: Plane[], sphere: [Vec3, number]){
    const rears: Plane[] = [];
    const fronts: Plane[] = [];
    const intersects: Plane[] = [];

    const [centerSphere, rSphere] = sphere;
    for(let i = 0; i < clippingPlanes.length; i++){
        const plane = clippingPlanes[i];
        const d = distancePointToPlane(plane, centerSphere);
        if(d < -rSphere){
            rears.push(plane);
        }
        if(d > rSphere){
            fronts.push(plane);
        }
        if(Math.abs(d) < rSphere){
            intersects.push(plane);
        }
    }

    // console.log("rears: ", rears.length);
    // console.log("fronts: ", fronts.length);
    // console.log("intersects: ", intersects.length);
    return { rears, fronts, intersects };
}

/**
 * 
 * @param intersectPlanes 
 * @param triangles 
 * @param verticies these verticies was transformed to cam space and was placed in new applieds list 
 */
function clipTriangle(intersectPlanes: Plane[], triangles: readonly Readonly<Triangle>[], verticies: Vec3[]){
    const triangleProcesseds: Triangle[] = [];

    for(let j = 0; j < triangles.length; j++){
        const triangle = triangles[j];
        triangleProcesseds.push(triangle);
        for(let i = 0; i < intersectPlanes.length; i++){
            const plane = intersectPlanes[i];
            const vertexA = verticies[triangle.x];
            const vertexB = verticies[triangle.y];
            const vertexC = verticies[triangle.z];
            const dA = distancePointToPlane(plane, vertexA);
            const dB = distancePointToPlane(plane, vertexB);
            const dC = distancePointToPlane(plane, vertexC);

            if(dA < 0 && dB < 0 && dC < 0){
                triangleProcesseds.pop();
                break;
            }
            else if(dA > 0 && dB > 0 && dC > 0){}
            else{
                if(oneVertexFront()){
                    break;
                }
                else if(twoVertexFront()){
                    break;
                }
            }

            function oneVertexFront(){
                const out = isOneVertexFront();
                if(!out){
                    return false;
                }
                
                triangleProcesseds.pop();
                const newTriangle1 = createOneTriangle(out[0], plane);
                const num_newVertex1 = verticies.push(newTriangle1[1]) - 1;
                const num_newVertex2 = verticies.push(newTriangle1[2]) - 1;
                switch(out[1]){
                    case "x":
                        triangleProcesseds.push(
                            { 
                                x: triangle.x,
                                y: num_newVertex1,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        break;
                    case "y":
                        triangleProcesseds.push(
                            { 
                                x: num_newVertex1,
                                y: triangle.y,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        break;
                    case "z":
                        triangleProcesseds.push(
                            { 
                                x: num_newVertex1,
                                y: num_newVertex2,
                                z: triangle.z,
                                color: triangle.color
                            }
                        );
                        break;
                }
        
                return true;
            }
            function twoVertexFront(){
                const out = isTwoVertexFront();
                if(!out){
                    return false;
                }

                triangleProcesseds.pop();
                const [newTriangle1, newTriangle2] = createTwoTriangle(out[0], plane);
                const num_newVertex1 = verticies.push(newTriangle1[1]) - 1;
                const num_newVertex2 = verticies.push(newTriangle1[2]) - 1;
                switch(out[1]){
                    case "xy":
                        triangleProcesseds.push(
                            { 
                                x: triangle.x,
                                y: num_newVertex1,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        triangleProcesseds.push(
                            { 
                                x: triangle.x,
                                y: triangle.y,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        break;
                    case "xz":
                        triangleProcesseds.push(
                            { 
                                x: triangle.x,
                                y: num_newVertex1,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        triangleProcesseds.push(
                            { 
                                x: triangle.x,
                                y: triangle.z,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        break;
                    case "yz":
                        triangleProcesseds.push(
                            { 
                                x: triangle.y,
                                y: num_newVertex1,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        triangleProcesseds.push(
                            { 
                                x: triangle.y,
                                y: triangle.z,
                                z: num_newVertex2,
                                color: triangle.color
                            }
                        );
                        break;
                }

                return true;
            }
            function isOneVertexFront(): false | [[Vec3, Vec3, Vec3], string]{
                if(dA > 0 && dB < 0 && dC < 0){
                    return [[vertexA, vertexB, vertexC], "x"];
                }
                if(dB > 0 && dA < 0 && dC < 0){
                    return [[vertexB, vertexA, vertexC], "y"];
                }
                if(dC > 0 && dA < 0 && dB < 0){
                    return [[vertexC, vertexA, vertexB], "z"];
                }
        
                return false;
            }
            function isTwoVertexFront(): false | [[Vec3, Vec3, Vec3], string]{
                if(dA > 0 && dB > 0 && dC < 0){
                    return [[vertexA, vertexB, vertexC], "xy"];
                }
                if(dA > 0 && dC > 0 && dB < 0){
                    return [[vertexA, vertexC, vertexB], "xz"];
                }
                if(dB > 0 && dC > 0 && dA < 0){
                    return [[vertexB, vertexC, vertexA], "yz"];
                }
        
                return false;
            }
        }
    }
    
    
    function getPointInLineAndThroughPlane(pointA: Vec3, pointB: Vec3, plane: Plane){
        const AB = subVec3(pointB, pointA);
        const t = (-plane.D - dot(plane.normal, pointA)) / dot(plane.normal, AB);

        return addVec3(pointA, scalarVec3(t, AB));
    }
    function createOneTriangle(old: readonly [Vec3, Vec3, Vec3], plane: Plane): [Vec3, Vec3, Vec3]{
        const pointB = getPointInLineAndThroughPlane(old[0], old[1], plane);
        const pointC = getPointInLineAndThroughPlane(old[0], old[2], plane);

        return [old[0], pointB, pointC];
    }
    function createTwoTriangle(old: readonly [Vec3, Vec3, Vec3], plane: Plane): [[Vec3, Vec3, Vec3], [Vec3, Vec3, Vec3]]{
        const pointA = getPointInLineAndThroughPlane(old[0], old[2], plane);
        const pointB = getPointInLineAndThroughPlane(old[1], old[2], plane);

        return [
            [old[0], pointA, pointB],
            [old[0], old[1], pointB]
        ] as const;
    }

    return triangleProcesseds;
}

function clipping(applieds: Vec3[], triangles: readonly Readonly<Triangle>[]){
    const clippingPlanes = getClippingPlanes();
    const status = clipWholeObject(clippingPlanes, getBoudingSphere(applieds));
    if(status.rears.length > 0){
        return false;
    }
    if(status.fronts.length == clippingPlanes.length){
        return triangles;
    }

    return clipTriangle(status.intersects, triangles, applieds);
}

function project(vertex: Vec3): Vec3{
    const m_Projection = makeProjectionTransform();

    return homogeneous3DToCartesian(
        m3x1ToVec3(
            multi_matrix(
                m_Projection,
                vec4ToM4x1(vec3ToVec4(vertex, 1))
            ) as M3x1
        )
    );
}

function renderInstance(instance: Instance, renderStatus?: RenderStatus){
    const model = instance.model;

    const applieds: Vec3[] = [];
    for(let vertex of model.vertices){
        vertex = apply(vertex, instance.transform);
        applieds.push(vertex);
    }

    const clippingTriangles = clipping(applieds, model.triangles)
    if(!clippingTriangles) return;

    const projecteds: Vec3[] = [];
    for(let vertex of applieds){
        const vertexProjected = project(vertex);
        projecteds.push(vertexProjected);
    }

    for(const triangle of clippingTriangles){
        renderTriangle(triangle, projecteds);
    }

    if(renderStatus){
        renderStatus.totalTrig += clippingTriangles.length;
    }
}

function renderScene(scene: Scene, renderStatus?: RenderStatus){
    if(renderStatus){
        renderStatus.totalTrig = 0;
    }
    
    for (const instance of scene.instances) {
        renderInstance(instance, renderStatus);
    }

    ctx.putImageData(ctxBuffer, 0, 0);
    ctxBuffer.data.fill(0);
    depthBuffer.fill(Infinity);
}

export { putPixel, drawLine, renderScene }