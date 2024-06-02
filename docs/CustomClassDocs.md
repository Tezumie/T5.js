# Creating Custom Extensions for T5

## Overview
This guide will show you how to create a simple class or library to extend the functionality of the T5 canvas library. You can access the main T5 instance and its methods to create custom drawing functions, utilities, or additional features.

## Step-by-Step Guide

### Step 1: Define Your Class
Create your custom class and pass the T5 instance to its constructor. This allows your class to interact with the T5 canvas.

```javascript
class MyClassName {
    constructor(t5Instance) {
        this.t5 = t5Instance;
    }

    // Example method: Custom drawing function with scaling for flexibleCanvas and pixel density
    customDrawFunction(x, y, size) {
        const scaledX = this.t5._scaleCoordinate(x);
        const scaledY = this.t5._scaleCoordinate(y);
        const scaledSize = this.t5._scaleCoordinate(size);
    }

    
}
```
### Accessing T5 Properties and Methods

Within your custom class, you can access any T5 properties or methods using this.t5.

#### Scaling Coordinates

If you need to scale coordinates, use the _scaleCoordinate method:

```javascript

const scaledX = this.t5._scaleCoordinate(x);
const scaledY = this.t5._scaleCoordinate(y);

```

If you are using the built in T5 `this.t5.beginShape()`, `this.t5.Vertex()`, `this.t5.endShape()` these are scaled automatically,
you don't need to scale your vertex with `this.t5._scaleCoordinate(x)`


### Step 2: Create an Instance of Your Class

Create an instance of your custom class and pass the T5 instance to it.

```javascript

const myCustomInstance = new MyClassName(myT5);

```


### Aliasing Functions for Global Scope

If you want to create global aliases for your custom methods, you can do so like this:

```javascript

const customDrawFunction = (x, y, size) => myCustomInstance.customDrawFunction(x, y, size);

```

### Step 3: Use Your Custom Methods

You can now use your custom methods just like any other T5 method.

```javascript

function setup() {
    createCanvas(400, 400);
    background(255);

    // Use custom drawing function
    customDrawFunction(200, 200, 50);
}

```

### Summary

By creating your own classes and passing the T5 instance to them, you can extend the T5 library with custom functionality. Use this.t5 to access T5 properties and methods, and scale coordinates using this.t5._scaleCoordinate(coord) if needed. Define global aliases to simplify usage.

If you want to see an example of accessing specific properties or fully built extensions, all of the libraries such as T5Vector, T5Element, T5Draw , etc use this guides format.




