import { cW, cH, ctx, Vec2 } from "./global";

function putPixel(x: number, y: number, color: CanvasFillStrokeStyles["fillStyle"]){
    x += cW / 2;
    y = -y + cW / 2;
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


export { putPixel, drawLine }