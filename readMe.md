[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

![T5 Logo](cover.png)

# T5.js Documentation

## Overview

T5.js is a lightweight and simplified 2D graphics library designed for drawing to the canvas. Inspired by p5.js, T5.js uses similar function names for ease of use and familiarity. It focuses on providing an intuitive API for creating and manipulating 2D graphics with minimal setup and overhead.

T5.js does not use any code from p5.js and is not affiliated with it. p5.js has some functionalities that T5.js does not yet have. If you're looking for a larger library with increased capabilities, check out [p5.js](https://github.com/processing/p5.js/tree/main).

T5.js serves as an alternative to p5.js, not a full replacement. If you're looking for a lightweight replacement for p5.js, check out [Q5.js](https://github.com/quinton-ashley/q5.js](https://github.com/quinton-ashley/q5.js).

## Features

- Easy-to-use API similar to p5.js
- Built-in dimension agnostic option
- Optimized for performance
- Modular design allowing for easy extension and customization

## Getting Started

### Installation

The quickest way to start using T5.js is with the aijs.io browser-based code editor.

Follow [this link](https://aijs.io/editor?user=Tezumie&project=T5JS) to open this entire GitHub repository in a browser-based code editor. Then, simply press the play button to see your sketch in action.

You can also include T5.js in your own project by downloading the library and adding it to your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>T5</title>
        <link rel="stylesheet" type="text/css" href="style.css" />
        <script src="T5Main.js"></script>
    </head>
    <body>
        <main></main>
        <script src="sketch.js"></script>
    </body>
</html>

```
You can use `<script src="T5Main.js"></script>` to access all of the available features.

Optionally, you can select which features you want and omit all the others. Individual libraries can be found in the libraries folder.


### Basic Setup

Here's a simple example to get you started with T5.js:

```js
let aspectRatio = 3 / 4;

function setup() {
  createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
  dimensionAgnostic(true, 1000);
}

function draw() {
  background(220);
  rect(0, 0, 500)
}
```
### Custom functions

There are some handy custom functions built into T5.js, such as gradient fills and strokes, noisy lines and shapes, border radius settings, and more. There are some useful examples in the examples folder where you can see how some of them work.

### Extending T5.js

You can create your own classes and extend the functionality of T5.js.

You can learn how in `docs/CustomClassDocs.md`.

### Contributing

We welcome contributions to T5.js! If you have suggestions, bug reports, or would like to contribute code, please open an issue or submit a pull request on GitHub.

Alternatively, reach out on Discord or join our community: https://discord.com/invite/eW7MbvXZbY

### In Development

-//********************************-T5Webgl-********************************//
-//********************************-T5Shaders-********************************//
-//********************************-T5Physics-********************************//
-//********************************-T5Sound-********************************//

### License

T5.js is released under the CC BY-NC license License. See the LICENSE file for details.

You can use, modify, and include T5 in any project you make or sell, but you can't sell T5 itself.

-NonCommercial: You can use T5 for non-commercial purposes only. You can’t sell the T5 library itself, but you can use it as part of your applications, which you can sell.

-Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made.

Attribution is already included at the top of the library.

```
/*!
 * T5.js - A lightweight 2D graphics library
 * 
 * Copyright (c) [2024] [Tezumie-aijs.io]
 * 
 * This library is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * You can use and modify T5 in any project you make or sell, but you can't sell T5 itself.
 * 
 * NonCommercial: You can use T5 for non-commercial purposes only. You can’t sell the T5 library itself, but you can use it as part of your applications, which you can sell.
 * 
 * Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made.
 * 
 * For more details, see the full license at https://creativecommons.org/licenses/by-nc/4.0/
 */
 ```








