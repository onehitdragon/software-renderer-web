import { Vec3, dot } from "./vector";

interface Plane{
    normal: Vec3,
    D: number
}

function distancePointToPlane(plane: Plane, point: Vec3){
    return dot(plane.normal, point) + plane.D;
}

export { Plane }
export { distancePointToPlane };