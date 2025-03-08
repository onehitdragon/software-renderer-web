#include "emscripten.h"
#include "emscripten/bind.h"
#include "common/vector.h"
#include "emscripten/stack.h"
#include "global.h"
#include <string>
#include <iostream>

// Vec3 v = {-5, -8, -9};

uintptr_t stack_base(){
    return emscripten_stack_get_base();
}
uintptr_t stack_end(){
    return emscripten_stack_get_end();
}
uintptr_t stack_current(){
    return emscripten_stack_get_current();
}

// std::vector<Vec3> sum(int n){
//     emscripten_run_script("alert('enter')");
//     std::vector<Vec3> arr1;
//     arr1.reserve(5);
//     emscripten_run_script("alert('start push_back')");
//     for(int i = 0; i < 5; i++){
//         arr1.push_back(Vec3(-(i + 1), -(i + 1), -(i + 1)));
//     }

    
//     emscripten_run_script("alert('start return')");
//     return arr1;
// }


EMSCRIPTEN_BINDINGS(index){
    emscripten::function("stack_base", &stack_base);
    emscripten::function("stack_end", &stack_end);
    emscripten::function("stack_current", &stack_current);

    // emscripten::function("sum1", &sum);
    // emscripten::function("sum2", &sum, emscripten::return_value_policy::take_ownership());
    // emscripten::function("sum3", &sum, emscripten::return_value_policy::reference());
}