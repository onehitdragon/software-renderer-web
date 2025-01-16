import { canvas, viewport, ctx, Vec2, Vec3, camera, arrayToVec3, arrayToVec4, arrayToTrigangle, Trigangle, addVec3, Instance, Scene, Transform, scalarVec3, multi_M3x3AndVec3, M3x3 } from "./global";

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

// function canvasToViewport(cPoint: Vec2): Vec3{
//     return {
//         x: cPoint.x * viewport.vW / canvas.cW,
//         y: cPoint.y * viewport.vH / canvas.cH,
//         z: camera.distanceToViewport
//     };
// }

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

function scale(vertex: Vec3, scale: number){
    return scalarVec3(vertex, scale);
}

function rotate(vertex: Vec3, rotation: number){
    const rotationRad = rotation * Math.PI / 180;
    const yRotMatrix: M3x3 = [
        [Math.cos(rotationRad), 0, Math.sin(rotationRad)],
        [0, 1, 0],
        [-Math.sin(rotationRad), 0, Math.cos(rotationRad)]
    ];
    vertex = multi_M3x3AndVec3(yRotMatrix, vertex);

    return vertex;
}

function translate(vertex: Vec3, translation: Vec3){
    return addVec3(vertex, translation);
}

function applyTransform(vertex: Vec3, transform: Transform): Vec3{
    vertex = scale(vertex, transform.scale);
    vertex = rotate(vertex, transform.rotation);
    vertex = translate(vertex, transform.translation);

    return vertex;
}

function renderInstance(instance: Instance){
    const model = instance.model;

    const projecteds: Vec2[] = [];
    for(let vertex of model.vertices) {
        vertex = applyTransform(vertex, instance.transform);
        projecteds.push(projectVertex(vertex));
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