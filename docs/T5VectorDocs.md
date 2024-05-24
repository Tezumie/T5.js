# T5Vector Documentation

## Overview
`T5Vector` is a class that represents a vector in 3D space and provides various methods for vector arithmetic, manipulation, and properties.

## Initialization
### `constructor(x = 0, y = 0, z = 0)`
Creates a new T5Vector.
- **Arguments:**
  - `x` (number, optional): The x-coordinate. Default is 0.
  - `y` (number, optional): The y-coordinate. Default is 0.
  - `z` (number, optional): The z-coordinate. Default is 0.

## Methods

### `toString()`
Returns a string representation of the vector.

### `set(x, y, z)`
Sets the vector's components.
- **Arguments:**
  - `x` (number|T5Vector|array): The x-coordinate, or a T5Vector or an array to copy values from.
  - `y` (number, optional): The y-coordinate.
  - `z` (number, optional): The z-coordinate.

### `copy()`
Returns a copy of the vector.

### `add(v)`
Adds another vector or scalar to the vector.
- **Arguments:**
  - `v` (number|T5Vector|array): The vector or scalar to add.

### `rem(v)`
Calculates the remainder when dividing the vector's components by another vector or scalar.
- **Arguments:**
  - `v` (number|T5Vector|array): The vector or scalar for the remainder operation.

### `sub(v)`
Subtracts another vector or scalar from the vector.
- **Arguments:**
  - `v` (number|T5Vector|array): The vector or scalar to subtract.

### `mult(v)`
Multiplies the vector by another vector or scalar.
- **Arguments:**
  - `v` (number|T5Vector|array): The vector or scalar to multiply by.

### `div(v)`
Divides the vector by another vector or scalar.
- **Arguments:**
  - `v` (number|T5Vector|array): The vector or scalar to divide by.

### `mag()`
Returns the magnitude (length) of the vector.

### `magSq()`
Returns the squared magnitude of the vector.

### `dot(v)`
Calculates the dot product of the vector with another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.

### `cross(v)`
Calculates the cross product of the vector with another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.

### `dist(v)`
Calculates the distance between the vector and another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.

### `normalize()`
Normalizes the vector to a unit vector.

### `limit(max)`
Limits the magnitude of the vector to the specified value.
- **Arguments:**
  - `max` (number): The maximum magnitude.

### `setMag(len)`
Sets the magnitude of the vector.
- **Arguments:**
  - `len` (number): The new magnitude.

### `heading()`
Returns the heading (angle) of the vector in 2D space.

### `setHeading(angle)`
Sets the heading (angle) of the vector in 2D space.
- **Arguments:**
  - `angle` (number): The new heading angle in radians.

### `rotate(angle)`
Rotates the vector by the specified angle in 2D space.
- **Arguments:**
  - `angle` (number): The angle to rotate by in radians.

### `angleBetween(v)`
Calculates the angle between the vector and another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.

### `lerp(v, amt)`
Linearly interpolates between the vector and another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.
  - `amt` (number): The interpolation amount (0.0 - 1.0).

### `slerp(v, amt)`
Spherically interpolates between the vector and another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.
  - `amt` (number): The interpolation amount (0.0 - 1.0).

### `reflect(n)`
Reflects the vector off a surface defined by a normal vector.
- **Arguments:**
  - `n` (T5Vector): The normal vector of the surface.

### `array()`
Returns the components of the vector as an array.

### `equals(v)`
Checks if the vector is equal to another vector.
- **Arguments:**
  - `v` (T5Vector): The other vector.

## Static Methods

### `static add(v1, v2)`
Adds two vectors.
- **Arguments:**
  - `v1` (T5Vector): The first vector.
  - `v2` (T5Vector): The second vector.

### `static sub(v1, v2)`
Subtracts one vector from another.
- **Arguments:**
  - `v1` (T5Vector): The first vector.
  - `v2` (T5Vector): The second vector.

### `static mult(v, n)`
Multiplies a vector by a scalar.
- **Arguments:**
  - `v` (T5Vector): The vector.
  - `n` (number): The scalar.

### `static div(v, n)`
Divides a vector by a scalar.
- **Arguments:**
  - `v` (T5Vector): The vector.
  - `n` (number): The scalar.

### `static dist(v1, v2)`
Calculates the distance between two vectors.
- **Arguments:**
  - `v1` (T5Vector): The first vector.
  - `v2` (T5Vector): The second vector.

### `static dot(v1, v2)`
Calculates the dot product of two vectors.
- **Arguments:**
  - `v1` (T5Vector): The first vector.
  - `v2` (T5Vector): The second vector.

### `static cross(v1, v2)`
Calculates the cross product of two vectors.
- **Arguments:**
  - `v1` (T5Vector): The first vector.
  - `v2` (T5Vector): The second vector.

### `static fromAngle(angle)`
Creates a 2D vector from an angle.
- **Arguments:**
  - `angle` (number): The angle in radians.

### `static fromAngles(theta, phi)`
Creates a 3D vector from spherical coordinates.
- **Arguments:**
  - `theta` (number): The polar angle in radians.
  - `phi` (number): The azimuthal angle in radians.

## Aliases
### `createVector(x, y, z)`
Creates a new T5Vector.
- **Arguments:**
  - `x` (number, optional): The x-coordinate. Default is 0.
  - `y` (number, optional): The y-coordinate. Default is 0.
  - `z` (number, optional): The z-coordinate. Default is 0.
