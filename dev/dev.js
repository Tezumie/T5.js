let bgColor = 0;
let circleColor = [255, 0, 0];
let circleSize = 50;
let circleX, circleY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  circleX = width / 2;
  circleY = height / 2;
  noStroke();
  
}

function draw() {
  background(bgColor);
  fill(circleColor);
  ellipse(circleX, circleY, circleSize);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    circleColor = [255, 0, 0];
  } else if (key === 'g' || key === 'G') {
    circleColor = [0, 255, 0];
  } else if (key === 'b' || key === 'B') {
    circleColor = [0, 0, 255];
  } else if (key === ' ') {
    bgColor = bgColor === 0 ? 255 : 0;
  }
}

function mousePressed() {
  circleX = mouseX;
  circleY = mouseY;
}

function mouseMoved() {
  circleX = mouseX;
  circleY = mouseY;
}

function mouseWheel(event) {
  circleSize += event.deltaY > 0 ? -5 : 5;
  circleSize = constrain(circleSize, 10, 200);
}


// let gfx1, gfx2, gfx3;

// function setup() {
//     createCanvas(window.innerWidth, window.innerWidth);
//     flexibleCanvas(800)
//     pixelDensity(2)
//     //   noLoop();
//     // Create three graphics buffers
//     gfx1 = createGraphics(300, 300);
//     gfx2 = createGraphics(400, 400);
//     gfx3 = createGraphics(400, 400);

//     // Draw something on gfx1
//     gfx1.background(100);
//     gfx1.rect(0, 0, gfx1.width, gfx1.height);
//     gfx1.fill(255, 0, 0);
//     gfx1.ellipse(150, 150, 150, 150);

//     // Draw something on gfx2
//     gfx2.background(50);
//     gfx2.fill(0, 255, 0);
//     gfx2.rect(150, 150, 100, 100);

//     // Draw something on gfx3
//     gfx3.background(200);
//     gfx3.fill(0, 0, 255);
//     gfx3.triangle(200, 100, 250, 300, 150, 300);
// }

// function draw() {
//     background(255);

//     // Quadrant 1: Draw directly on the main canvas
//     fill(255, 255, 0);
//     rect(50, 50, 300, 300);

//     // Quadrant 2: Copy from gfx1 to the main canvas
//     let p = image(gfx1, 450, 50, 300, 300);
//     //   console.log(gfx1.width)
//     //   console.log(p.width)
//     // Quadrant 3: Copy from gfx2 to gfx3
//     gfx3.copy(gfx2, 0, 0, gfx2.width, gfx2.height, 0, 0, gfx3.width, gfx3.height);
//     image(gfx3, 50, 450, 300, 300);

//     // Quadrant 4: Copy from the main canvas to gfx1 only once
//     if (frameCount === 1) {
//         gfx1.copy(50, 50, 300, 300, 0, 0, 400, 400);
//     }
//     image(gfx1, 450, 450, 300, 300);
//     ellipse(mouseX, mouseY, 150, 150);
// }
// let angle = 0;
// function setup() {
//     createCanvas(1400, 1400);
//     angle = (3.1415926535 / 4);
//     strokeWeight(3);
//     stroke('#008709');

// }
// function draw() {
//     background('#ffffff');
//     translate((width / 2), height);
//     branch(400);
// }
// function branch(len) {
//     line(0, 0, 0, (len * -1));
//     translate(0, (len * -1));
//     if((len > 4)){
//         push();
//         rotate(angle);
//         branch((len * 0.67));
//         pop();
//         push();
//         rotate((angle * -1));
//         branch((len * 0.67));
//         pop();
//     }
//     else{
//         return ;
//     }
// }

// let img, Canvas;

// function setup() {
//     Canvas = createCanvas(800, 800);
//     background(255);
//     noLoop();
// }

// function draw() {
//     createSimplePattern();
//     createPattern();

//     background(255);

//     // Draw and clip the pattern to a rectangle
//     rect(width / 2 - width / 4, 0, width / 2, height / 2);
//     beginPattern();
//     image(img, 0, 0);
//     endPattern();

//     // Draw and clip the pattern to an ellipse
//     ellipse(width / 2, height - width / 4, width / 2);
//     beginPattern();
//     image(img, 0, 0);
//     endPattern();
// }

// function createPattern() {
//     img = createGraphics(width, height);
//     img.copy(Canvas, 0, 0, width, height, 0, 0, img.width, img.height);
//     clear();
// }

// function beginPattern() {
//     drawingContext.save();
//     drawingContext.clip();
// }

// function endPattern() {
//     drawingContext.restore();
// }

// function createSimplePattern() {
//     stroke(0);
//     strokeWeight(2);
//     for (let x = 0; x < width; x += 20) {
//         for (let y = 0; y < height; y += 20) {
//             line(x, y, x + 10, y + 10);
//             line(x + 10, y, x, y + 10);
//         }
//     }
// }

