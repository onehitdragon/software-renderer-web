#ifndef FIXEDNUMBER_H
#define FIXEDNUMBER_H

#include "vector.h"
#include "vectorint.h"

extern unsigned int fixedNumber_RESOLUTION;
extern unsigned int fixedNumber_MULTIPLIER;

Vec2Int fixedNumber_fixedXY(const Vec3 &vec);

#endif