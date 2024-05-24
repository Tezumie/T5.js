# T5Draw Documentation

## Overview
`T5Draw` is a class that provides additional drawing functionalities for the T5 canvas, including noise-based shapes and gradient fills.

## Initialization
### `constructor(t5Instance)`
Creates a new T5Draw instance.
- **Arguments:**
  - `t5Instance` (object): The T5 canvas instance to associate with this drawing manager.

## Methods

### `noiseLine(x1, y1, x2, y2, noiseScale = 0.1, noiseStrength = 10)`
Draws a line with noise distortion.
- **Arguments:**
  - `x1` (number): The starting x-coordinate.
  - `y1` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.
  - `noiseScale` (number, optional): The scale of the noise. Default is 0.1.
  - `noiseStrength` (number, optional): The strength of the noise distortion. Default is 10.

### `noiseEllipse(x, y, width, height, noiseScale = 0.1, noiseStrength = 10)`
Draws an ellipse with noise distortion.
- **Arguments:**
  - `x` (number): The x-coordinate of the center.
  - `y` (number): The y-coordinate of the center.
  - `width` (number): The width of the ellipse.
  - `height` (number): The height of the ellipse.
  - `noiseScale` (number, optional): The scale of the noise. Default is 0.1.
  - `noiseStrength` (number, optional): The strength of the noise distortion. Default is 10.

### `noiseRect(x, y, width, height, noiseScale = 0.1, noiseStrength = 10)`
Draws a rectangle with noise distortion.
- **Arguments:**
  - `x` (number): The x-coordinate of the top-left corner.
  - `y` (number): The y-coordinate of the top-left corner.
  - `width` (number): The width of the rectangle.
  - `height` (number): The height of the rectangle.
  - `noiseScale` (number, optional): The scale of the noise. Default is 0.1.
  - `noiseStrength` (number, optional): The strength of the noise distortion. Default is 10.

### `gradientFill(color1, color2, x, y, x2, y2)`
Sets a linear gradient fill.
- **Arguments:**
  - `color1` (string): The starting color.
  - `color2` (string): The ending color.
  - `x` (number): The starting x-coordinate.
  - `y` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.

### `gradientStroke(color1, color2, x, y, x2, y2)`
Sets a linear gradient stroke.
- **Arguments:**
  - `color1` (string): The starting color.
  - `color2` (string): The ending color.
  - `x` (number): The starting x-coordinate.
  - `y` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.

### `radialFill(color1, color2, x, y, radius)`
Sets a radial gradient fill.
- **Arguments:**
  - `color1` (string): The inner color.
  - `color2` (string): The outer color.
  - `x` (number): The x-coordinate of the center.
  - `y` (number): The y-coordinate of the center.
  - `radius` (number): The radius of the gradient.

### `radialStroke(color1, color2, x, y, radius)`
Sets a radial gradient stroke.
- **Arguments:**
  - `color1` (string): The inner color.
  - `color2` (string): The outer color.
  - `x` (number): The x-coordinate of the center.
  - `y` (number): The y-coordinate of the center.
  - `radius` (number): The radius of the gradient.

### `dynamicGradient(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0)`
Creates a dynamic gradient.
- **Arguments:**
  - `type` (string): The gradient type ('linear' or 'radial').
  - `colorStops` (array): An array of color stop objects with `offset` and `color` properties.
  - `x1` (number): The starting x-coordinate.
  - `y1` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.
  - `r1` (number, optional): The starting radius (for radial gradients). Default is 0.
  - `r2` (number, optional): The ending radius (for radial gradients). Default is 0.

### `dynamicFill(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0)`
Sets a dynamic gradient fill.
- **Arguments:**
  - `type` (string): The gradient type ('linear' or 'radial').
  - `colorStops` (array): An array of color stop objects with `offset` and `color` properties.
  - `x1` (number): The starting x-coordinate.
  - `y1` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.
  - `r1` (number, optional): The starting radius (for radial gradients). Default is 0.
  - `r2` (number, optional): The ending radius (for radial gradients). Default is 0.

### `dynamicStroke(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0)`
Sets a dynamic gradient stroke.
- **Arguments:**
  - `type` (string): The gradient type ('linear' or 'radial').
  - `colorStops` (array): An array of color stop objects with `offset` and `color` properties.
  - `x1` (number): The starting x-coordinate.
  - `y1` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.
  - `r1` (number, optional): The starting radius (for radial gradients). Default is 0.
  - `r2` (number, optional): The ending radius (for radial gradients). Default is 0.

## Aliases

### Global functions
- `noiseLine(x, y, x2, y2, noiseScale, noiseStrength)`: Alias for `myT5Draw.noiseLine(x, y, x2, y2, noiseScale, noiseStrength)`
- `noiseEllipse(x, y, width, height, noiseScale, noiseStrength)`: Alias for `myT5Draw.noiseEllipse(x, y, width, height, noiseScale, noiseStrength)`
- `noiseRect(x, y, width, height, noiseScale, noiseStrength)`: Alias for `myT5Draw.noiseRect(x, y, width, height, noiseScale, noiseStrength)`
- `gradientFill(color1, color2, x, y, x2, y2)`: Alias for `myT5Draw.gradientFill(color1, color2, x, y, x2, y2)`
- `gradientStroke(color1, color2, x, y, x2, y2)`: Alias for `myT5Draw.gradientStroke(color1, color2, x, y, x2, y2)`
- `radialFill(color1, color2, x, y, radius)`: Alias for `myT5Draw.radialFill(color1, color2, x, y, radius)`
- `radialStroke(color1, color2, x, y, radius)`: Alias for `myT5Draw.radialStroke(color1, color2, x, y, radius)`
- `dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2)`: Alias for `myT5Draw.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2)`
- `dynamicFill(type, colorStops, x1, y1, x2, y2, r1, r2)`: Alias for `myT5Draw.dynamicFill(type, colorStops, x1, y1, x2, y2, r1, r2)`
- `dynamicStroke(type, colorStops, x1, y1, x2, y2, r1, r2)`: Alias for `myT5Draw.dynamicStroke(type, colorStops, x1, y1, x2, y2, r1, r2)`
