#include "emscripten.h"
#include "emscripten/bind.h"
#include "common/vector.h"
#include "global.h"

Triangle::Triangle():x(0), y(0), z(0){}
Triangle::Triangle(int x, int y, int z, Vec4 color): x(x), y(y), z(z), color(color){}

Model::Model(){}
Model::Model(int num_vertices, int num_triangles){
    vertices.reserve(num_vertices);
    triangles.reserve(num_triangles);
}

Transform::Transform(){}
Transform::Transform(Vec3 translation, float rotation, float scale): translation(translation), rotation(rotation), scale(scale){}

Instance::Instance(){}
Instance::Instance(Model *model): model(model){}

Camera::Camera(){}
Camera::Camera(float distanceToViewport, Transform transform): distanceToViewport(distanceToViewport), transform(transform){}
Camera camera = {1, Transform(Vec3(0, 0, 0), 0, 0)};

EMSCRIPTEN_BINDINGS(global){
    emscripten::class_<Vec2>("Vec2")
        .constructor()
        .constructor<float, float>()
        .property("x", &Vec2::x)
        .property("y", &Vec2::y)
        ;
    emscripten::class_<Vec3, emscripten::base<Vec2>>("Vec3")
        .constructor()
        .constructor<float, float, float>()
        .property("z", &Vec3::z)
        ;
    emscripten::class_<Vec4, emscripten::base<Vec3>>("Vec4")
        .constructor()
        .constructor<float, float, float, float>()
        .property("w", &Vec4::w)
        ;
    emscripten::class_<Triangle>("Triangle")
        .constructor()
        .constructor<int, int, int, Vec4>()
        .property("x", &Triangle::x)
        .property("y", &Triangle::y)
        .property("z", &Triangle::z)
        .property("color", &Triangle::color, emscripten::return_value_policy::reference())
        ;
    emscripten::class_<Model>("Model")
        .constructor()
        .constructor<int, int>()
        .property("vertices", &Model::vertices, emscripten::return_value_policy::reference())
        .property("triangles", &Model::triangles, emscripten::return_value_policy::reference())
        ;
    emscripten::register_vector<Vec3>("vector<Vec3>");
    emscripten::register_vector<Triangle>("vector<Triangle>");
    emscripten::class_<Transform>("Transform")
        .constructor()
        .constructor<Vec3, float, float>()
        .property("translation", &Transform::translation, emscripten::return_value_policy::reference())
        .property("rotation", &Transform::rotation)
        .property("scale", &Transform::scale)
        ;
    emscripten::class_<Instance>("Instance")
        .constructor()
        .constructor<Model*>()
        .property("model", &Instance::model, emscripten::return_value_policy::reference())
        .property("transform", &Instance::transform, emscripten::return_value_policy::reference())
        ;
}