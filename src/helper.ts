import { homogeneous3DToCartesian, m3x1ToVec3, m4x1ToVec3, m4x1ToVec4, vec3ToVec4, vec4ToM4x1 } from "./common/converter";
import { M3x1, M3x3, M3x4, M4x1, M4x4, Matrix, multi_M3x3AndVec3, multi_M4x4AndVec4, multi_matrix } from "./common/matrix";
import { Plane, distancePointToPlane } from "./common/plane";
import { Vec2, Vec3, Vec4, addVec3, colorToVec4, createVec3, dot, roundVec2, roundVec3, roundXYVec3, lengthVec3, scalarCrossVec2, scalarVec3, subVec3, subVec2 } from "./common/vector";
import { canvas, viewport, ctx, camera, Triangle, Instance, Scene, Transform, ctxBuffer, RenderStatus, depthBuffer} from "./global";
import * as fixedNumber from "./fixedNumber";

function viewportToCanvasCoordinate(vec3: Vec3): Vec3{
    return {
        x: vec3.x + canvas.half_cW,
        y: -vec3.y + canvas.half_cH,
        z: vec3.z
    }
}

function putPixelZ(x: number, y: number, z: number, color: Vec4){
    // if(x < 0 || x >= canvas.cW || y < 0 || y >= canvas.cH){
    //     return;
    // }

    if(z > depthBuffer[x + y * canvas.cW]){
        return;
    }
    else{
        depthBuffer[x + y * canvas.cW] = z;
    }

    const offset = (x * 4) + (y * canvas.four_mul_cW);

    ctxBuffer.data[offset + 0] = color.x;
    ctxBuffer.data[offset + 1] = color.y;
    ctxBuffer.data[offset + 2] = color.z;
    ctxBuffer.data[offset + 3] = color.w;
}

function putPixel(x: number, y: number, color: Vec4){
    // if(x < 0 || x >= canvas.cW || y < 0 || y >= canvas.cH){
    //     return;
    // }

    const offset = (x * 4) + (y * canvas.four_mul_cW);

    ctxBuffer.data[offset + 0] = color.x;
    ctxBuffer.data[offset + 1] = color.y;
    ctxBuffer.data[offset + 2] = color.z;
    ctxBuffer.data[offset + 3] = color.w;
}

function putPixelWithOffset(offset: number, color: Vec4){
    ctxBuffer.data[offset] = color.x;
    ctxBuffer.data[offset + 1] = color.y;
    ctxBuffer.data[offset + 2] = color.z;
    ctxBuffer.data[offset + 3] = color.w;
}

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

// function drawLine(start: Vec2, end: Vec2, color: Vec4){
//     const dx = Math.abs(end.x - start.x);
//     const dy = Math.abs(end.y - start.y);

//     if(dx >= dy){
//         if(start.x > end.x){
//             [start, end] = swap(start, end);
//         }
//         const ys = interpolate(start.x, start.y, end.x, end.y);
//         for(let x = start.x; x <= end.x; x++){
//             putPixel(x, ys[Math.ceil(x - start.x)], color);
//         }
//     }
//     else{
//         if(start.y > end.y){
//             [start, end] = swap(start, end);
//         }
//         const xs = interpolate(start.y, start.x, end.y, end.x);
//         for(let y = start.y; y <= end.y; y++){
//             putPixel(xs[Math.ceil(y - start.y)], y, color);
//         }
//     }
// }

function drawLineH(start: Vec2, end: Vec2, color: Vec4){
    let dy = end.y - start.y;
    let dx = end.x - start.x;
    let sy = 1;
    if(end.y < start.y){
        sy = -1;
        dy = -dy;
    }
    let p = 2 * dy - dx;
    const incrE = 2 * dy;
    const incrNE = 2 * (dy - dx);
    let y = start.y;

    for(let x = start.x; x <= end.x; x++){
        putPixel(x, y, color);
        if(p > 0){
            p += incrNE;
            y += sy;
        }
        else{
            p += incrE;
        }
    }
}

function drawLineV(start: Vec2, end: Vec2, color: Vec4){
    let dy = end.y - start.y;
    let dx = end.x - start.x;
    let sx = 1;
    if(end.x < start.x){
        sx = -1;
        dx = -dx;
    }
    let p = 2 * dx - dy;
    const incrE = 2 * dx;
    const incrNE = 2 * (dx - dy);
    let x = start.x;

    for(let y = start.y; y <= end.y; y++){
        putPixel(x, y, color);
        if(p > 0){
            p += incrNE;
            x += sx;
        }
        else{
            p += incrE;
        }
    }
}

function drawLine(start: Vec2, end: Vec2, color: Vec4){
    start = roundVec2(start);
    end = roundVec2(end);
    const dy = end.y - start.y;
    const dx = end.x - start.x;
    if(Math.abs(dx) >= Math.abs(dy)){
        if(start.x > end.x){
            [start, end] = swap(start, end);
        }
        drawLineH(start, end, color);
    }
    else{
        if(start.y > end.y){
            [start, end] = swap(start, end);
        }
        drawLineV(start, end, color);
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
    p1 = viewportToCanvasCoordinate(p1);
    p2 = viewportToCanvasCoordinate(p2);
    p3 = viewportToCanvasCoordinate(p3);
    drawLine(p1, p2, color);
    drawLine(p2, p3, color);
    drawLine(p3, p1, color);
}

function drawFilledTriangle1(p1: Vec3, p2: Vec3, p3: Vec3, color: Vec4){
    color = colorToVec4("black");
    p1 = viewportToCanvasCoordinate(p1);
    p2 = viewportToCanvasCoordinate(p2);
    p3 = viewportToCanvasCoordinate(p3);
    const p12 = subVec2(p2, p1);
    const p13 = subVec2(p3, p1);
    if(scalarCrossVec2(p12, p13) > 0){
        [p2, p3] = swap(p2, p3);
    }

    p1 = fixedNumber.fixedXY(p1);
    p2 = fixedNumber.fixedXY(p2);
    p3 = fixedNumber.fixedXY(p3);
    const xMin = Math.min(p1.x, p2.x, p3.x) >> fixedNumber.RESOLUTION;
    const yMin = Math.min(p1.y, p2.y, p3.y) >> fixedNumber.RESOLUTION;
    const xMax = Math.max(p1.x, p2.x, p3.x) + 15 >> fixedNumber.RESOLUTION;
    const yMax = Math.max(p1.y, p2.y, p3.y) + 15 >> fixedNumber.RESOLUTION;
    const dx12 = p2.x - p1.x;
    const dx23 = p3.x - p2.x;
    const dx31 = p1.x - p3.x;
    const dy12 = p2.y - p1.y;
    const dy23 = p3.y - p2.y;
    const dy31 = p1.y - p3.y;
    const dx12F = dx12 << fixedNumber.RESOLUTION;
    const dx23F = dx23 << fixedNumber.RESOLUTION;
    const dx31F = dx31 << fixedNumber.RESOLUTION;
    const dy12F = dy12 << fixedNumber.RESOLUTION;
    const dy23F = dy23 << fixedNumber.RESOLUTION;
    const dy31F = dy31 << fixedNumber.RESOLUTION;
    let C1 = dy12 * p1.x - dx12 * p1.y;
    let C2 = dy23 * p2.x - dx23 * p2.y;
    let C3 = dy31 * p3.x - dx31 * p3.y;
    if(dy12 > 0 || (dy12 == 0 && dx12 < 0)){
        C1--;
    }
    if(dy23 > 0 || (dy23 == 0 && dx23 < 0)){
        C2--;
    }
    if(dy31 > 0 || (dy31 == 0 && dx31 < 0)){
        C3--;
    }

    const xMinF = (xMin << fixedNumber.RESOLUTION) + 8;
    const yMinF = (yMin << fixedNumber.RESOLUTION) + 8;
    let cy12 = C1 + dx12 * yMinF - dy12 * xMinF;
    let cy23 = C2 + dx23 * yMinF - dy23 * xMinF;
    let cy31 = C3 + dx31 * yMinF - dy31 * xMinF;

    let bufferOffset = 4 * xMin + 4 * canvas.cW * yMin;
    const stride = 4 * (canvas.cW - xMax) + 4 * xMin;

    for(let y = yMin; y < yMax; y++){
        let cx12 = cy12;
        let cx23 = cy23;
        let cx31 = cy31;
        for(let x = xMin; x < xMax; x++){
            if(cx12 < 0 && cx23 < 0 && cx31 < 0){
                putPixelWithOffset(bufferOffset, color);
            }
            bufferOffset += 4;
            cx12 -= dy12F;
            cx23 -= dy23F;
            cx31 -= dy31F;
        }
        bufferOffset += stride;
        cy12 += dx12F;
        cy23 += dx23F;
        cy31 += dx31F;
    }
}

function drawFilledTriangle(p1: Vec3, p2: Vec3, p3: Vec3, color: Vec4){
    color = colorToVec4("black");
    p1 = viewportToCanvasCoordinate(p1);
    p2 = viewportToCanvasCoordinate(p2);
    p3 = viewportToCanvasCoordinate(p3);

    const p12 = subVec2(p2, p1);
    const p13 = subVec2(p3, p1);
    if(scalarCrossVec2(p12, p13) > 0){
        [p2, p3] = swap(p2, p3);
    }

    p1 = fixedNumber.fixedXY(p1);
    p2 = fixedNumber.fixedXY(p2);
    p3 = fixedNumber.fixedXY(p3);
    let xMin = Math.min(p1.x, p2.x, p3.x) >> fixedNumber.RESOLUTION;
    let yMin = Math.min(p1.y, p2.y, p3.y) >> fixedNumber.RESOLUTION;
    const xMax = Math.max(p1.x, p2.x, p3.x) + 15 >> fixedNumber.RESOLUTION;
    const yMax = Math.max(p1.y, p2.y, p3.y) + 15 >> fixedNumber.RESOLUTION;
    const dx12 = p2.x - p1.x;
    const dx23 = p3.x - p2.x;
    const dx31 = p1.x - p3.x;
    const dy12 = p2.y - p1.y;
    const dy23 = p3.y - p2.y;
    const dy31 = p1.y - p3.y;
    const dx12F = dx12 << fixedNumber.RESOLUTION;
    const dx23F = dx23 << fixedNumber.RESOLUTION;
    const dx31F = dx31 << fixedNumber.RESOLUTION;
    const dy12F = dy12 << fixedNumber.RESOLUTION;
    const dy23F = dy23 << fixedNumber.RESOLUTION;
    const dy31F = dy31 << fixedNumber.RESOLUTION;
    let C1 = dy12 * p1.x - dx12 * p1.y;
    let C2 = dy23 * p2.x - dx23 * p2.y;
    let C3 = dy31 * p3.x - dx31 * p3.y;
    if(dy12 > 0 || (dy12 == 0 && dx12 < 0)){
        C1--;
    }
    if(dy23 > 0 || (dy23 == 0 && dx23 < 0)){
        C2--;
    }
    if(dy31 > 0 || (dy31 == 0 && dx31 < 0)){
        C3--;
    }

    const q = 8;
    xMin = xMin & ~(q - 1);
    yMin = yMin & ~(q - 1);

    for(let y = yMin; y < yMax; y += q){
        for(let x = xMin; x < xMax; x += q){
            const x0 = (x << fixedNumber.RESOLUTION) + 8;
            const y0 = (y << fixedNumber.RESOLUTION) + 8;
            const x1 = (x + q - 1 << fixedNumber.RESOLUTION) + 8;
            const y1 = (y + q - 1 << fixedNumber.RESOLUTION) + 8;

            const _00_12 = C1 + dx12 * y0 - dy12 * x0 < 0;
            const _10_12 = C1 + dx12 * y0 - dy12 * x1 < 0;
            const _01_12 = C1 + dx12 * y1 - dy12 * x0 < 0;
            const _11_12 = C1 + dx12 * y1 - dy12 * x1 < 0;

            const _00_23 = C2 + dx23 * y0 - dy23 * x0 < 0;
            const _10_23 = C2 + dx23 * y0 - dy23 * x1 < 0;
            const _01_23 = C2 + dx23 * y1 - dy23 * x0 < 0;
            const _11_23 = C2 + dx23 * y1 - dy23 * x1 < 0;

            const _00_31 = C3 + dx31 * y0 - dy31 * x0 < 0;
            const _10_31 = C3 + dx31 * y0 - dy31 * x1 < 0;
            const _01_31 = C3 + dx31 * y1 - dy31 * x0 < 0;
            const _11_31 = C3 + dx31 * y1 - dy31 * x1 < 0;

            const a = 
            Number(_00_12) + Number(_10_12) + Number(_01_12) + Number(_11_12) +
            Number(_00_23) + Number(_10_23) + Number(_01_23) + Number(_11_23) +
            Number(_00_31) + Number(_10_31) + Number(_01_31) + Number(_11_31);

            if(a == 0){
                continue; // ignore block
            }

            if(a == 12){
                // accept block
                for(let yi = y; yi < y + q; yi++){
                    for(let xi = x; xi < x + q; xi++){
                        putPixel(xi, yi, color);
                    }
                }
            }
            else{
                // partially block
                let cy12 = C1 + dx12 * y0 - dy12 * x0;
                let cy23 = C2 + dx23 * y0 - dy23 * x0;
                let cy31 = C3 + dx31 * y0 - dy31 * x0;
                for(let yi = y; yi < y + q; yi++){
                    let cx12 = cy12;
                    let cx23 = cy23;
                    let cx31 = cy31;
                    for(let xi = x; xi < x + q; xi++){
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

function renderTriangle(trigangle: Triangle, projecteds: Vec3[]){
    drawFilledTriangle(
        projecteds[trigangle.x],
        projecteds[trigangle.y],
        projecteds[trigangle.z],
        trigangle.color
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

function getBoudingSphere(verticies: readonly Readonly<Vec3>[]): [Vec3, number]{
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

function clipWholeObject(clippingPlanes: readonly Readonly<Plane>[], sphere: [Vec3, number]){
    const rears: Plane[] = [];
    const fronts: Plane[] = [];
    const intersects: Plane[] = [];

    const [centerSphere, rSphere] = sphere;
    for(let i = 0; i < clippingPlanes.length; i++){
        const plane = clippingPlanes[i];
        const d = distancePointToPlane(plane, centerSphere);
        if(d < -rSphere){
            rears.push(plane);
            break;
        }
        if(d > rSphere){
            fronts.push(plane);
        }
        if(Math.abs(d) < rSphere){
            intersects.push(plane);
        }
    }

    return { rears, fronts, intersects };
}

/**
 * 
 * @param intersectPlanes 
 * @param triangles 
 * @param verticies these verticies was transformed to cam space and was placed in new applieds list 
 */
function clipTriangle(
    intersectPlanes: readonly Readonly<Plane>[],
    triangles: readonly Readonly<Triangle>[],
    verticies: Vec3[]
){
    const trianglesWaitingProcess: [Triangle, number][] = Array.from(triangles, (triangle) => [triangle, 0]);
    const trianglesProcessed: Triangle[] = [];

    while(trianglesWaitingProcess.length > 0){
        const triangleWaitingProcess = trianglesWaitingProcess.pop()!;
        const triangle = triangleWaitingProcess[0];
        const startPlane = triangleWaitingProcess[1];
        let front = 0;
        for(let i = startPlane; i < intersectPlanes.length; i++){
            const plane = intersectPlanes[i];
            const vertexA = verticies[triangle.x];
            const vertexB = verticies[triangle.y];
            const vertexC = verticies[triangle.z];
            const dA = distancePointToPlane(plane, vertexA);
            const dB = distancePointToPlane(plane, vertexB);
            const dC = distancePointToPlane(plane, vertexC);

            if(dA < 0 && dB < 0 && dC < 0){
                break;
            }
            else if(dA >= 0 && dB >= 0 && dC >= 0){
                front++;
                continue;
            }
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
                
                const [frontVertex, rearVertex1, rearVertex2] = out[0];
                const intersectVertex1 = getPointInLineAndThroughPlane(frontVertex, rearVertex1, plane);
                const intersectVertex2 = getPointInLineAndThroughPlane(frontVertex, rearVertex2, plane);
                const frontIndex = out[1];
                const num_newVertex1 = verticies.push(intersectVertex1) - 1;
                const num_newVertex2 = verticies.push(intersectVertex2) - 1;
                const newTriangle = {
                    x: frontIndex,
                    y: num_newVertex1,
                    z: num_newVertex2,
                    color: triangle.color
                };
                trianglesWaitingProcess.push([newTriangle, i + 1]);
        
                return true;
            }
            function twoVertexFront(){
                const out = isTwoVertexFront();
                if(!out){
                    return false;
                }

                const [frontVertex1, frontVertex2, rearVertex] = out[0];
                const intersectVertex1 = getPointInLineAndThroughPlane(frontVertex1, rearVertex, plane);
                const intersectVertex2 = getPointInLineAndThroughPlane(frontVertex2, rearVertex, plane);
                const [frontIndex1, frontIndex2] = out[1];
                const num_newVertex1 = verticies.push(intersectVertex1) - 1;
                const num_newVertex2 = verticies.push(intersectVertex2) - 1;
                const newTriangle1 = {
                    x: frontIndex1,
                    y: frontIndex2,
                    z: num_newVertex1,
                    color: triangle.color
                };
                const newTriangle2 = {
                    x: frontIndex2,
                    y: num_newVertex1,
                    z: num_newVertex2,
                    color: triangle.color
                };
                trianglesWaitingProcess.push([newTriangle1, i + 1]);
                trianglesWaitingProcess.push([newTriangle2, i + 1]);

                return true;
            }
            /**
             * 
             * @returns [[front vertex, rear vertex, rear vertex], front index]
             */
            function isOneVertexFront(): false | [[Vec3, Vec3, Vec3], number]{
                if(dA >= 0 && dB < 0 && dC < 0){
                    return [[vertexA, vertexB, vertexC], triangle.x];
                }
                if(dB >= 0 && dA < 0 && dC < 0){
                    return [[vertexB, vertexA, vertexC], triangle.y];
                }
                if(dC >= 0 && dA < 0 && dB < 0){
                    return [[vertexC, vertexA, vertexB], triangle.z];
                }
        
                return false;
            }
            /**
             * 
             * @returns [[front vertex, front vertex, rear vertex], [front index, front index]]
             */
            function isTwoVertexFront(): false | [[Vec3, Vec3, Vec3], [number, number]]{
                if(dA >= 0 && dB >= 0 && dC < 0){
                    return [[vertexA, vertexB, vertexC], [triangle.x, triangle.y]];
                }
                if(dA >= 0 && dC >= 0 && dB < 0){
                    return [[vertexA, vertexC, vertexB], [triangle.x, triangle.z]];
                }
                if(dB >= 0 && dC >= 0 && dA < 0){
                    return [[vertexB, vertexC, vertexA], [triangle.y, triangle.z]];
                }
        
                return false;
            }
        }
        if(front == intersectPlanes.length - startPlane){
            trianglesProcessed.push(triangle);
        }
    }
    
    function getPointInLineAndThroughPlane(pointA: Vec3, pointB: Vec3, plane: Plane){
        const AB = subVec3(pointB, pointA);
        const t = (-plane.D - dot(plane.normal, pointA)) / dot(plane.normal, AB);

        return addVec3(pointA, scalarVec3(t, AB));
    }

    return trianglesProcessed;
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

function makeProjectionTransform(): M3x4{
    return [
        [camera.distanceToViewport * canvas.cW / viewport.vW, 0, 0, 0],
        [0, camera.distanceToViewport * canvas.cH / viewport.vH, 0, 0],
        [0, 0, 1, 0]
    ]
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

    let i = 0;
    const start = performance.now();
    for(const triangle of clippingTriangles){
        //setTimeout(() => {
            //if(i == 2)
                renderTriangle(triangle, projecteds);

            //ctx.putImageData(ctxBuffer, 0, 0);
        //}, i * 1000);
        i++;
    }
    const end = performance.now();

    if(renderStatus){
        renderStatus.totalTrig += clippingTriangles.length;
        renderStatus.renderTimeTake = end - start;
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

export { putPixel, renderScene }