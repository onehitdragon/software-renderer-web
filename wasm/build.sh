emcc="C:\Users\Admin\Desktop\code\emsdk\upstream\emscripten\emcc"
optimize=O0

$emcc \
    "./src/common/vector.cpp" \
    -${optimize} \
    -c -o "./out/vector.o"
$emcc \
    "./src/common/matrix.cpp" \
    -${optimize} \
    -c -o "./out/matrix.o"
$emcc \
    "./src/global.cpp" \
    -${optimize} \
    -c -o "./out/global.o"
$emcc \
    "./src/helper.cpp" \
    -${optimize} \
    -c -o "./out/helper.o"
$emcc \
    "./src/index.cpp" \
    -${optimize} \
    -c -o "./out/index.o"
$emcc \
    "./out/vector.o" \
    "./out/matrix.o" \
    "./out/global.o" \
    "./out/helper.o" \
    "./out/index.o" \
    -${optimize} \
    -o "./out/test.js" \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -lembind
    # -s EXPORTED_FUNCTIONS=['_malloc','_free'] \

echo "Moving wasm files..."
mv -f ./out/*.wasm ../dist