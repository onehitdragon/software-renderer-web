import { homogeneous3DToCartesian2D, homogeneous4DToCartesian3D, m3x1ToVec3, m4x1ToVec3, m4x1ToVec4, vec3ToVec4, vec4ToM4x1 } from "./common/converter";
import { M3x1, M3x3, M3x4, M4x1, M4x4, Matrix, multi_M3x3AndVec3, multi_M4x4AndVec4, multi_matrix } from "./common/matrix";
import { Plane, distancePointToPlane } from "./common/plane";
import { Vec2, Vec3, Vec4, addVec3, lengthVec3, scalarVec3, subVec3 } from "./common/vector";
import { canvas, viewport, ctx, camera, Trigangle, Instance, Scene, Transform} from "./global";

function putPixel(x: number, y: number, color: CanvasFillStrokeStyles["fillStyle"]){
    x += canvas.cW / 2;
    y = -y + canvas.cW / 2;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function swap(vec1: Vec2, vec2: Vec2){
    return [vec2, vec1];
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

function drawLine(start: Vec2, end: Vec2, color: CanvasFillStrokeStyles["fillStyle"]){
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    if(dx >= dy){
        if(start.x > end.x){
            [start, end] = swap(start, end);
        }
        const ys = interpolate(start.x, start.y, end.x, end.y);
        for(let x = start.x; x <= end.x; x++){
            putPixel(x, ys[x - start.x], color);
        }
    }
    else{
        if(start.y > end.y){
            [start, end] = swap(start, end);
        }
        const xs = interpolate(start.y, start.x, end.y, end.x);
        for(let y = start.y; y <= end.y; y++){
            putPixel(xs[y - start.y], y, color);
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

function drawTriangle(p1: Vec2, p2: Vec2, p3: Vec2, color: CanvasFillStrokeStyles["fillStyle"]){
    drawLine(p1, p2, color);
    drawLine(p2, p3, color);
    drawLine(p3, p1, color);
}

function renderTriangle(trigangle: Trigangle, projecteds: Vec2[]){
    drawTriangle(
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

function apply(vertex: Vec3, transform: Transform): Vec3{
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
    const rears: number[] = [];
    const fronts: number[] = [];
    const intersects: number[] = [];

    const [centerSphere, rSphere] = sphere;
    for(let i = 0; i < clippingPlanes.length; i++){
        const plane = clippingPlanes[i];
        const d = distancePointToPlane(plane, centerSphere);
        if(d < -rSphere){
            rears.push(i);
        }
        if(d > rSphere){
            fronts.push(i);
        }
        if(Math.abs(d) < rSphere){
            intersects.push(i);
        }
    }

    // console.log("rears: ", rears.length);
    // console.log("fronts: ", fronts.length);
    // console.log("intersects: ", intersects.length);
    return { rears, fronts, intersects };
}

function clipTriangle(intersectPlanes: Plane[], triangles: Trigangle[], verticies: Vec3[]){
    const triangleStatuses: {
        rears: number[], fronts: number[], intersects: number[]
    }[] = [];
    const triangleIntersectStatuses: {
        triangleIndex: number,
        rears: number[], fronts: number[], intersects: number[]
    }[] = [];

    for(let j = 0; j < triangles.length; j++){
        triangleStatuses.push({ rears: [], fronts: [], intersects: []});
        const triangle = triangles[j];
        for(let i = 0; i < intersectPlanes.length; i++){
            const plane = intersectPlanes[i];
            const dA = distancePointToPlane(plane, verticies[triangle.x]);
            const dB = distancePointToPlane(plane, verticies[triangle.y]);
            const dC = distancePointToPlane(plane, verticies[triangle.z]);
            if(dA < 0 && dB < 0 && dC < 0){
                triangleStatuses[j].rears.push(i);
            }
            else if(dA > 0 && dB > 0 && dC > 0){
                triangleStatuses[j].fronts.push(i);
            }
            else{

            }
        }
    }
}

function clipping(verticies: Vec3[]){
    const clippingPlanes = getClippingPlanes();
    const status = clipWholeObject(clippingPlanes, getBoudingSphere(verticies));
    if(status.rears.length > 0){

    }
    if(status.fronts.length == clippingPlanes.length){
        
    }
}

function project(vertex: Vec3): Vec2{
    const m_Projection = makeProjectionTransform();

    return homogeneous3DToCartesian2D(
        m3x1ToVec3(
            multi_matrix(
                m_Projection,
                vec4ToM4x1(vec3ToVec4(vertex, 1))
            ) as M3x1
        )
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

// function renderInstance(instance: Instance){
//     const model = instance.model;

//     const projecteds: Vec2[] = [];
//     for(let vertex of model.vertices){
//         vertex = apply(vertex, instance.transform);
//         const vertexTo2D = project(vertex);
//         projecteds.push(vertexTo2D);
//     }
//     for(const trigangle of model.trigangles){
//         renderTriangle(trigangle, projecteds);
//     }
// }

function renderInstance(instance: Instance){
    const model = instance.model;

    const projecteds: Vec2[] = [];
    const applieds: Vec3[] = [];
    for(let vertex of model.vertices){
        vertex = apply(vertex, instance.transform);
        applieds.push(vertex);
        const vertexTo2D = project(vertex);
        projecteds.push(vertexTo2D);
    }

    clipping(applieds);
    
    for(const triangle of model.triangles){
        renderTriangle(triangle, projecteds);
    }
}

function renderScene(scene: Scene){
    for (const instance of scene.instances) {
        renderInstance(instance);
    }
}

export { putPixel, drawLine, renderScene }