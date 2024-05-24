# T5Canvas Documentation

## Overview
`T5Canvas` is the main component of the T5 library that handles typical drawing operations and setup/draw functionality. It provides a range of methods to create and manipulate a canvas for creative coding.

## Initialization
### `constructor()`
Initializes the T5Canvas instance and sets up properties.

### `createCanvas(w, h)`
Creates and appends the canvas to the document body.
- **Arguments:**
  - `w` (number): Width of the canvas.
  - `h` (number): Height of the canvas.

### `resizeCanvas(w, h)`
Resizes the canvas.
- **Arguments:**
  - `w` (number): New width of the canvas.
  - `h` (number): New height of the canvas.

### `pixelDensity(val)`
Gets or sets the pixel density of the canvas.
- **Arguments:**
  - `val` (number, optional): The pixel density value. If omitted, returns the current pixel density.

### `dimensionAgnostic(enabled, unit = 400)`
Sets the canvas to dimension-agnostic mode.
- **Arguments:**
  - `enabled` (boolean): Enable or disable dimension-agnostic mode.
  - `unit` (number, optional): The unit size for dimension-agnostic mode.

## Drawing and Rendering
### `drawToBuffer(buffer)`
Sets the current drawing target to the specified offscreen buffer.
- **Arguments:**
  - `buffer` (object): The offscreen buffer to draw to.

### `drawToCanvas()`
Sets the current drawing target back to the main canvas.

### `fill(...args)`
Sets the fill color.
- **Arguments:**
  - `...args` (array): Color arguments.

### `noFill()`
Disables the fill color.

### `stroke(...args)`
Sets the stroke color.
- **Arguments:**
  - `...args` (array): Color arguments.

### `noStroke()`
Disables the stroke color.

### `setStrokeType(type)`
Sets the stroke type.
- **Arguments:**
  - `type` (string): The stroke type.

### `strokeWeight(weight)`
Sets the stroke weight.
- **Arguments:**
  - `weight` (number): The stroke weight.

### `background(...args)`
Sets the background color.
- **Arguments:**
  - `...args` (array): Color arguments.

### `borderRadius(...radii)`
Sets the border radius.
- **Arguments:**
  - `...radii` (array): Radius values.

### `loadImage(path, callback)`
Loads an image from a given path.
- **Arguments:**
  - `path` (string): The image path.
  - `callback` (function, optional): The callback to execute after the image loads.

### `setTexture(imageOrBuffer, mode = 'cover')`
Sets a texture for shapes.
- **Arguments:**
  - `imageOrBuffer` (object|string): The image or buffer to use as texture.
  - `mode` (string, optional): The texture mode, either 'cover' or 'contain'.

### `image(img, x, y, width, height = width, mode = 'cover')`
Draws an image on the canvas.
- **Arguments:**
  - `img` (object): The image to draw.
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.
  - `width` (number): The width of the image.
  - `height` (number, optional): The height of the image.
  - `mode` (string, optional): The texture mode.

## Shape Drawing
### `beginShape()`
Begins recording vertices for a shape.

### `vertex(x, y)`
Adds a vertex to the current shape.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.

### `endShape(close = true)`
Ends the current shape.
- **Arguments:**
  - `close` (boolean, optional): Whether to close the shape.

### `point(x, y)`
Draws a point at the given coordinates.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.

### `ellipse(x, y, width, height = width)`
Draws an ellipse.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.
  - `width` (number): The width of the ellipse.
  - `height` (number, optional): The height of the ellipse.

### `rect(x, y, width, height = width)`
Draws a rectangle.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.
  - `width` (number): The width of the rectangle.
  - `height` (number, optional): The height of the rectangle.

### `line(x, y, x2, y2)`
Draws a line between two points.
- **Arguments:**
  - `x` (number): The starting x-coordinate.
  - `y` (number): The starting y-coordinate.
  - `x2` (number): The ending x-coordinate.
  - `y2` (number): The ending y-coordinate.

### `triangle(x1, y1, x2, y2, x3, y3)`
Draws a triangle.
- **Arguments:**
  - `x1` (number): The first vertex x-coordinate.
  - `y1` (number): The first vertex y-coordinate.
  - `x2` (number): The second vertex x-coordinate.
  - `y2` (number): The second vertex y-coordinate.
  - `x3` (number): The third vertex x-coordinate.
  - `y3` (number): The third vertex y-coordinate.

### `quad(x1, y1, x2, y2, x3, y3, x4, y4)`
Draws a quadrilateral.
- **Arguments:**
  - `x1` (number): The first vertex x-coordinate.
  - `y1` (number): The first vertex y-coordinate.
  - `x2` (number): The second vertex x-coordinate.
  - `y2` (number): The second vertex y-coordinate.
  - `x3` (number): The third vertex x-coordinate.
  - `y3` (number): The third vertex y-coordinate.
  - `x4` (number): The fourth vertex x-coordinate.
  - `y4` (number): The fourth vertex y-coordinate.

### `polygon(x, y, radius, verts)`
Draws a polygon.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.
  - `radius` (number): The radius of the polygon.
  - `verts` (number): The number of vertices.

## Transformations
### `push()`
Saves the current drawing state.

### `pop()`
Restores the previously saved drawing state.

### `translate(x, y)`
Translates the canvas origin.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.

### `rotate(angle)`
Rotates the canvas.
- **Arguments:**
  - `angle` (number): The rotation angle in radians.

### `scale(sx, sy = sx)`
Scales the canvas.
- **Arguments:**
  - `sx` (number): The x-axis scale factor.
  - `sy` (number, optional): The y-axis scale factor.

### `resetMatrix()`
Resets the transformation matrix.

### `applyMatrix(a, b, c, d, e, f)`
Applies a transformation matrix.
- **Arguments:**
  - `a` (number): Horizontal scaling.
  - `b` (number): Horizontal skewing.
  - `c` (number): Vertical skewing.
  - `d` (number): Vertical scaling.
  - `e` (number): Horizontal translation.
  - `f` (number): Vertical translation.

### `shearX(angle)`
Shears the canvas along the x-axis.
- **Arguments:**
  - `angle` (number): The shear angle in radians.

### `shearY(angle)`
Shears the canvas along the y-axis.
- **Arguments:**
  - `angle` (number): The shear angle in radians.

## Utility Methods
### `erase(fillStrength = 255, strokeStrength = 255)`
Enables the eraser mode.
- **Arguments:**
  - `fillStrength` (number, optional): The eraser fill strength.
  - `strokeStrength` (number, optional): The eraser stroke strength.

### `noErase()`
Disables the eraser mode.

### `clear()`
Clears the canvas.

### `saveCanvas(filename = 'untitled', extension = 'png')`
Saves the canvas content as an image file.
- **Arguments:**
  - `filename` (string, optional): The name of the file.
  - `extension` (string, optional): The file extension ('png' or 'jpg').

### `disableContextMenu()`
Disables the context menu on the canvas.

### `noLoop()`
Stops the draw loop.

### `loop()`
Starts the draw loop.

### `frameRate(value)`
Gets or sets the frame rate.
- **Arguments:**
  - `value` (number, optional): The frame rate value. If omitted, returns the current frame rate.

### `windowResized(callback)`
Registers a callback to be executed when the window is resized.
- **Arguments:**
  - `callback` (function): The callback function.

### `viewBuffer(buffer, x = 0, y = 0)`
Draws an offscreen buffer onto the main canvas.
- **Arguments:**
  - `buffer` (object): The offscreen buffer to draw.
  - `x` (number, optional): The x-coordinate.
  - `y` (number, optional): The y-coordinate.

### `hideBuffer()`
Clears the canvas and redraws the background.

### `noise(x, y = 0, z = 0)`
Generates Perlin noise value.
- **Arguments:**
  - `x` (number): The x-coordinate.
  - `y` (number, optional): The y-coordinate.
  - `z` (number, optional): The z-coordinate.

### `random(min, max)`
Generates a random number.
- **Arguments:**
  - `min` (number): The minimum value.
  - `max` (number): The maximum value.

### `randomSeed(seed)`
Sets the seed for the random number generator.
- **Arguments:**
  - `seed` (number): The seed value.

### `noiseSeed(seed)`
Sets the seed for the noise generator.
- **Arguments:**
  - `seed` (number): The seed value.
