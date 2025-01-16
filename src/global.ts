const canvas = document.getElementById("canvas1") as HTMLCanvasElement | null;
if(canvas == null){
    throw "dont find canvas1";
}
const cW = canvas.getAttribute("width") as unknown as number;
const cH = canvas.getAttribute("height") as unknown as number;
const ctx = canvas.getContext("2d")!;

interface Vec2{
    x: number,
    y: number
}

interface Vec3 extends Vec2{
    z: number
}

export { cW, cH, ctx }
export { Vec2, Vec3 }