## T5.js Custom Functions

### borderRadius(radius)
Sets the border radius for vertices. Accepts a single number or an array of numbers. The array lists radii in order from the first to the last vertex. If your shape has more vertices than radii provided, it will use the last radius for the remaining vertices.

**Parameters:**
- `radius`: A number or an array of numbers specifying the border radii.

**Example:**
```js
borderRadius(20);
borderRadius(0, 30, 0, 0);
```

### innerBorderRadius(radius)
Same as `borderRadius` but for inner vertices created with `innerVertex`.

**Parameters:**
- `radius`: A number or an array of numbers specifying the inner border radii.

**Example:**
```js
innerBorderRadius(20);
innerBorderRadius(0, 30, 0, 0);
```

### noBorderRadius()
Sets all border radii (inner and regular) to 0.

**Example:**
```js
noBorderRadius();
```

### innerVertex(x, y)
Works in conjunction with `beginShape`, `endShape`, and `vertex` functions. Provides coordinates for an inner shape to be cut from the main shape made with `vertex`.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.

**Example:**
```js
beginShape();
vertex(100, 100);
vertex(200, 100);
vertex(200, 200);
vertex(100, 200);

innerVertex(120, 120);
innerVertex(180, 120);
innerVertex(180, 180);
innerVertex(120, 180);
endShape(CLOSE);
```

### gradientFill(type, stops)
Creates a gradient fill. Accepts gradient type (`LINEAR` or `RADIAL`) and an array of color stops.

**Parameters:**
- `type`: The type of gradient (`LINEAR` or `RADIAL`).
- `stops`: An array of objects specifying the gradient stops.

**Example:**
```js
gradientFill(LINEAR, [
    { startX: 0, startY: 0, endX: 100, endY: 0 },
    { colorStop: 0, color: '#ff0000' },
    { colorStop: 1, color: '#0000ff' }
]);
gradientFill(RADIAL, [
    { startX: 150, startY: 150, radius: 50 },
    { colorStop: 0, color: '#ff0000' },
    { colorStop: 1, color: '#ffff00' }
]);
```

### gradientStroke(type, stops)
Creates a gradient stroke. Accepts gradient type (`LINEAR` or `RADIAL`) and an array of color stops.

**Parameters:**
- `type`: The type of gradient (`LINEAR` or `RADIAL`).
- `stops`: An array of objects specifying the gradient stops.

**Example:**
```js
gradientStroke(LINEAR, [
    { startX: 0, startY: 0, endX: 100, endY: 0 },
    { colorStop: 0, color: '#88ff00' },
    { colorStop: 1, color: '#00fff2' }
]);
gradientStroke(RADIAL, [
    { startX: 200, startY: 200, radius: 70 },
    { colorStop: 0, color: '#1900ff' },
    { colorStop: 1, color: '#ffffff' }
]);
```

### gradientBackground(type, stops)
Creates a gradient background that covers the entire canvas. Accepts gradient type (`LINEAR` or `RADIAL`) and an array of color stops.

**Parameters:**
- `type`: The type of gradient (`LINEAR` or `RADIAL`).
- `stops`: An array of objects specifying the gradient stops.

**Example:**
```js
gradientBackground(LINEAR, [
    { startX: 0, startY: 0, endX: window.innerWidth, endY: 0 },
    { colorStop: 0, color: '#ff0000' },
    { colorStop: 1, color: '#0000ff' }
]);
gradientBackground(RADIAL, [
    { startX: window.innerWidth / 2, startY: window.innerHeight / 2, radius: window.innerWidth / 2 },
    { colorStop: 0, color: '#ff0000' },
    { colorStop: 1, color: '#ffff00' }
]);
```

### noiseLine(x1, y1, x2, y2, noiseScale = 0.05, noiseStrength = 35)
Draws a line with noise distortion.

**Parameters:**
- `x1`: Starting X-coordinate.
- `y1`: Starting Y-coordinate.
- `x2`: Ending X-coordinate.
- `y2`: Ending Y-coordinate.
- `noiseScale`: (Optional) Scale of the noise.
- `noiseStrength`: (Optional) Strength of the noise.

**Example:**
```js
noiseLine(100, 100, 200, 200, 0.05, 35);
```

### noiseEllipse(cx, cy, radius, noiseScale = 0.1, noiseStrength = 30, steps = 50)
Draws an ellipse with noise distortion.

**Parameters:**
- `cx`: Center X-coordinate.
- `cy`: Center Y-coordinate.
- `radius`: Radius of the ellipse.
- `noiseScale`: (Optional) Scale of the noise.
- `noiseStrength`: (Optional) Strength of the noise.
- `steps`: (Optional) Number of steps to approximate the ellipse.

**Example:**
```js
noiseEllipse(150, 150, 100, 0.1, 30, 50);
```

### noiseRect(x, y, width, height = width, noiseScale = 0.1, noiseStrength = 35)
Draws a rectangle with noise distortion.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `width`: Width of the rectangle.
- `height`: (Optional) Height of the rectangle.
- `noiseScale`: (Optional) Scale of the noise.
- `noiseStrength`: (Optional) Strength of the noise.

**Example:**
```js
noiseRect(200, 200, 100, 100, 0.1, 35);
```

### polygon(x, y, radius, verts)
Draws a polygon with a given number of vertices.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `radius`: Radius of the polygon.
- `verts`: Number of vertices.

**Example:**
```js
polygon(300, 300, 50, 6);
```

### star(x, y, radius1, radius2, points)
Draws a star with alternating outer and inner radii.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `radius1`: Outer radius of the star.
- `radius2`: Inner radius of the star.
- `points`: Number of points.

**Example:**
```js
star(400, 400, 50, 25, 5);
```

### hollowRect(x, y, w, h = w, innerPadding = 20)
Draws a rectangle with a hollow center.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `w`: Width of the rectangle.
- `h`: (Optional) Height of the rectangle.
- `innerPadding`: Padding for the inner rectangle.

**Example:**
```js
hollowRect(100, 100, 200, 100, 20);
```

### hollowPolygon(x, y, radius, verts, innerRadius)
Draws a polygon with a hollow center.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `radius`: Radius of the outer polygon.
- `verts`: Number of vertices.
- `innerRadius`: Radius of the inner polygon.

**Example:**
```js
hollowPolygon(200, 200, 100, 6, 50);
```

### hollowStar(x, y, radius1, radius2, points, innerRadius1, innerRadius2)
Draws a star with a hollow center.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `radius1`: Outer radius of the star.
- `radius2`: Inner radius of the star.
- `points`: Number of points.
- `innerRadius1`: Inner radius for outer points.
- `innerRadius2`: Inner radius for inner points.

**Example:**
```js
hollowStar(300, 300, 100, 50, 5, 50, 25);
```

### hollowEllipse(x, y, w, h = w, innerPadding = 20)
Draws an ellipse with a hollow center.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `w`: Width of the ellipse.
- `h`: (Optional) Height of the ellipse.
- `innerPadding`: Padding for the inner ellipse.

**Example:**
```js
hollowEllipse(400, 400, 200, 100, 20);
```

### fillArea(x, y, color)
Works like a bucket tool. Sets a color at the specified coordinates and spreads the color to all neighboring areas of the same color.

**Parameters:**
- `x`: X-coordinate.
- `y`: Y-coordinate.
- `color`: Color to fill the area.

**Example:**
```js
fillArea(50, 50, '#ff0000');
```



## T5.js Physics Addon Documentation

*WIP*