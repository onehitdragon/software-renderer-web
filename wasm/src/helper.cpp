#include "emscripten.h"
#include "emscripten/bind.h"
#include "global.h"
#include "common/matrix.h"
#include <cmath>

M4x4 makeModelTransform(const Transform &transform){
    M4x4 m_scale = {
        transform.scale, 0, 0, 0,
        0, transform.scale, 0, 0,
        0, 0, transform.scale, 0,
        0, 0, 0, 1
    };
    float rotationRad = transform.rotation * M_PI / 180;
    M4x4 m_rotation = {
        std::cos(rotationRad), 0, std::sin(rotationRad), 0,
        0, 1, 0, 0,
        -(std::sin(rotationRad)), 0, std::cos(rotationRad), 0,
        0, 0, 0, 1
    };
    M4x4 m_translation = {
        1, 0, 0, transform.translation.x,
        0, 1, 0, transform.translation.y,
        0, 0, 1, transform.translation.z,
        0, 0, 0, 1
    };

    return multi_matrix4x4(multi_matrix4x4(m_translation, m_rotation), m_scale);
}

M4x4 makeCameraTransform(){
    M4x4 m_translation = {
        1, 0, 0, -camera.transform.translation.x,
        0, 1, 0, -camera.transform.translation.y,
        0, 0, 1, -camera.transform.translation.z,
        0, 0, 0, 1
    };
    float rotationRad = -camera.transform.rotation * M_PI / 180;
    M4x4 m_rotation = {
        std::cos(rotationRad), 0, std::sin(rotationRad), 0,
        0, 1, 0, 0,
        -(std::sin(rotationRad)), 0, std::cos(rotationRad), 0,
        0, 0, 0, 1
    };

    return multi_matrix4x4(m_rotation, m_translation);
}

std::vector<Vec3> apply(const Instance &instance){
    M4x4 m_Model = makeModelTransform(instance.transform);
    M4x4 m_Camera = makeCameraTransform();
    M4x4 m_CameraModel = multi_matrix4x4(
        m_Camera,
        m_Model
    );

    std::vector<Vec3> applieds;
    applieds.reserve(instance.model->vertices.size());

    for(int i = 0, n = instance.model->vertices.size(); i < n; i++){
        Vec3 applied = M4x1_to_vec3(
            multi_matrix4x4(
                m_CameraModel,
                vec3_to_M4x1(instance.model->vertices[i])
            )
        );
        applieds.push_back(applied);

        M4x1 a = multi_matrix4x4(
            m_CameraModel,
            vec3_to_M4x1(instance.model->vertices[i])
        );
    }

    return applieds;
}

EMSCRIPTEN_BINDINGS(helper){
    emscripten::function("apply", &apply, emscripten::return_value_policy::take_ownership());
}
