import { drawLine, putPixel } from "./helper";

console.log("hello: " + new Date().toString());

drawLine({ x: -50, y: 100 }, { x: 50, y: 120 }, "red");
drawLine({ x: -10, y: 100 }, { x: 0, y: 200 }, "blue");
