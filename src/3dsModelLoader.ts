import { Vec3, colorToVec4 } from "./common/vector";
import { Model, Triangle } from "./global";

const MAIN_CHUNK_ID = 0x4D4D;
const EDITOR_CHUNK_ID = 0x3D3D;
const EDIT_CONFIG1_CHUNK_ID = 0x0001;
const OBJECT_BLOCK_CHUNK_ID = 0x4000;
const TRIANGULAR_MESH_CHUNK_ID = 0x4100;
const VERTICES_LIST_CHUNK_ID = 0x4110;
const FACES_DESCRIPTION_CHUNK_ID = 0x4120;
const MAPPING_COORDINATES_LIST_CHUNK_ID = 0x4140;

function chunkIdToString(chunkId: number){
    switch (chunkId) {
        case MAIN_CHUNK_ID:
            return "MAIN_CHUNK";
        case EDITOR_CHUNK_ID:
            return "EDITOR_CHUNK";
        case EDIT_CONFIG1_CHUNK_ID:
            return "EDIT_CONFIG1_CHUNK";
        case OBJECT_BLOCK_CHUNK_ID:
            return "OBJECT_BLOCK_CHUNK";
        case TRIANGULAR_MESH_CHUNK_ID:
            return "TRIANGULAR_MESH_CHUNK";
        case VERTICES_LIST_CHUNK_ID:
            return "VERTICES_LIST_CHUNK";
        case FACES_DESCRIPTION_CHUNK_ID:
            return "FACES_DESCRIPTION_CHUNK";
        case MAPPING_COORDINATES_LIST_CHUNK_ID:
            return "MAPPING_COORDINATES_LIST_CHUNK";
        default:
            return "UNDEFINED";
    }
}

async function loadModelAtPath(path: string): Promise<Model>{
    const model: Model = {
        name: "",
        vertices: [],
        triangles: []
    }

    const res = await fetch(path);
    const arrayBuffer = await res.arrayBuffer();
    const reader = new DataView(arrayBuffer);
    let offset = 0;

    // find MAIN_CHUNK
    let chunkId = reader.getUint16(offset, true); offset += 2;
    if(chunkId != MAIN_CHUNK_ID){
        throw `${chunkId.toString(16)} is not MAIN_CHUNK_ID`;
    }
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    let chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);

    // find EDITOR_CHUNK
    const ignoreOtherChunkUntil = (chunkIdTarget: number) => {
        while(1){
            chunkId = reader.getUint16(offset, true);
            if(chunkId == chunkIdTarget){
                break;
            }
            offset += 2;
            console.log(`Ignore Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
            chunkLength = reader.getUint32(offset, true); offset += 4;
            console.log("Chunk_Length: " + chunkLength);
            offset += chunkLength - 6;
        }
    }
    ignoreOtherChunkUntil(EDITOR_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);

    // find OBJECT_BLOCK_CHUNK
    ignoreOtherChunkUntil(OBJECT_BLOCK_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);
    let objectName = "";
    while(1){
        const cCode = reader.getUint8(offset); offset++;
        if(cCode != 0){
            objectName += String.fromCharCode(cCode);
        }
        else{
            break;
        }
    }
    console.log(`Object_Name: ${objectName}`);
    model.name = objectName;

    // find TRIANGULAR_MESH_CHUNK
    ignoreOtherChunkUntil(TRIANGULAR_MESH_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);

    // find VERTICES_LIST_CHUNK
    ignoreOtherChunkUntil(VERTICES_LIST_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);
    let verticesAmount = reader.getUint16(offset, true); offset += 2;
    console.log("Vertices_Amount: " + verticesAmount);
    // 3 vertex, 4 bytes each, 12 bytes total
    const vertices: Vec3[] = [];
    for(let i = 0; i < verticesAmount; i++){
        const x = reader.getFloat32(offset, true); offset += 4;
        const y = reader.getFloat32(offset, true); offset += 4;
        const z = reader.getFloat32(offset, true); offset += 4;
        vertices.push({ x, y, z });
    }
    model.vertices = vertices;

    // find FACES_DESCRIPTION_CHUNK
    ignoreOtherChunkUntil(FACES_DESCRIPTION_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);
    chunkLength = reader.getUint32(offset, true); offset += 4;
    console.log("Chunk_Length: " + chunkLength);
    let polygonAmount = reader.getUint16(offset, true); offset += 2;
    console.log("Polygon_Amount: " + polygonAmount);
    // 3 indicies 1 face info, 2 bytes each, 8 bytes total
    const triangles: Triangle[] = [];
    for(let i = 0; i < polygonAmount; i++){
        const x = reader.getUint16(offset, true); offset += 2;
        const y = reader.getUint16(offset, true); offset += 2;
        const z = reader.getUint16(offset, true); offset += 2;
        const w = reader.getUint16(offset, true); offset += 2;
        triangles.push({ x, y, z, color: colorToVec4("black") });
    }
    model.triangles = triangles;

    ///////////////////////////////////////
    // ignoreOtherChunkUntil(MAPPING_COORDINATES_LIST_CHUNK_ID);
    chunkId = reader.getUint16(offset, true); offset += 2;
    console.log(`Chunk_Id: ${chunkId.toString(16)} (${chunkIdToString(chunkId)})`);

    return model;
}

export { loadModelAtPath }