#include "emscripten.h"
#include "emscripten/bind.h"

class Pair{
public:
    int a;
    int b;
};

int sum(Pair *p, int v){
    return p->a + p->b + v;
}

EMSCRIPTEN_BINDINGS(Pair_class){
    emscripten::class_<Pair>("Pair")
        .constructor()
        .property("a", &Pair::a)
        .property("b", &Pair::b)
        ;
    emscripten::function("sum", &sum, emscripten::allow_raw_pointers());
}