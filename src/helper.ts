import { homogeneous3DToCartesian2D, homogeneous4DToCartesian3D, m3x1ToVec3, m4x1ToVec4, vec3ToVec4, vec4ToM4x1 } from "./common/converter";
import { M3x1, M3x3, M3x4, M4x1, M4x4, multi_M3x3AndVec3, multi_M4x4AndVec4, multi_matrix } from "./common/matrix";
import { Vec2, Vec3, Vec4, addVec3, scalarVec3, subVec3 } from "./common/vector";
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

function apply(vertex: Vec3, transform: Transform): Vec2{
    const m_Model = makeModelTransform(transform);
    const m_Camera = makeCameraTransform();
    const m_Projection = makeProjectionTransform();

    return homogeneous3DToCartesian2D(
        m3x1ToVec3(
            multi_matrix(
                m_Projection,
                multi_matrix(
                    multi_matrix(
                        m_Camera,
                        m_Model
                    ) as M4x4,
                    vec4ToM4x1(vec3ToVec4(vertex, 1))
                ) as M4x1
            ) as M3x1
        )
    );
}

function renderInstance(instance: Instance){
    const model = instance.model;

    const projecteds: Vec2[] = [];
    for(let vertex of model.vertices) {
        const vertexTo2D = apply(vertex, instance.transform);
        projecteds.push(vertexTo2D);
    }
    for(const trigangle of model.trigangles) {
        renderTriangle(trigangle, projecteds);
    }
}

function renderScene(scene: Scene){
    for (const instance of scene.instances) {
        renderInstance(instance);
    }
}

export { putPixel, drawLine, renderScene }