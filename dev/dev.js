let img;
let filters = [];

function preload() {
  img = loadImage('t5-logo.png'); // Load the brick image
}

function setup() {
  createCanvas(window.innerWidth, window.innerWidth);
  noStroke();
  noLoop();

  filters = [
    { type: GRAY, label: "GRAY" },
    { type: INVERT, label: "INVERT" },
    { type: THRESHOLD, label: "THRESHOLD", value: 0.5 },
    { type: POSTERIZE, label: "POSTERIZE", value: 3 },
    { type: BLUR, label: "BLUR", value: 5 },
    { type: ERODE, label: "ERODE", value: 3 },
    { type: DILATE, label: "DILATE", value: 3 },
    { type: OPAQUE, label: "OPAQUE" },
    { type: SEPIA, label: "SEPIA", value: 1 },
    { type: BRIGHTNESS, label: "BRIGHTNESS", value: 2 },
    { type: SATURATION, label: "SATURATION", value: 5 },
    { type: CONTRAST, label: "CONTRAST", value: 5 }
  ];

  let cols = 4; 
  let rows = Math.ceil(filters.length / cols);
  let cellWidth = width / cols;
  let cellHeight = height / rows;

  for (let i = 0; i < filters.length; i++) {
    let x = (i % cols) * cellWidth;
    let y = Math.floor(i / cols) * cellHeight;

    let g = createGraphics(cellWidth, cellHeight);
    g.image(img, 0, 0, cellWidth, cellHeight); 

    let filter = filters[i];
    if (filter.value !== undefined) {
      g.filter(filter.type, filter.value); 
    } else {
      g.filter(filter.type); 
    }

    image(g, x, y);

    fill(0);
    textAlign(CENTER, TOP);
    textSize(16);
    text(filter.label, x + cellWidth / 2, y + cellHeight + 5);
  }
}

// let gridGraphics = [];
// let g2;
// let cellHeight;

// function setup() {
//   createCanvas(window.innerWidth, window.innerWidth);
//   noStroke();
//   noLoop();
//   // Define filters to apply
//   let filters = [GRAY, INVERT, THRESHOLD, POSTERIZE, BLUR, ERODE, DILATE, OPAQUE]

//   // Create graphics with different filters
//   let cols = 3;
//   let rows = 3;
//   let cellWidth = width / cols;
//   cellHeight = height / rows;

//   for (let i = 0; i < filters.length; i++) {
//     let x = (i % cols) * cellWidth;
//     let y = Math.floor(i / cols) * cellHeight;

//     let g = createGraphics(cellWidth, cellHeight);
//     g.noStroke();
//     g.background(220, 20, 60); // Crimson background
//     g.fill(255); // White asterisk
//     g.textAlign(CENTER, CENTER);
//     g.textSize(cellHeight * 2);
//     g.text("*", cellWidth / 2, cellHeight);

//     // Apply filter
//     if (filters[i] === POSTERIZE) {
//       g.filter(filters[i], 5); // Posterize with level 5
//     } else if (filters[i] === THRESHOLD) {
//       g.filter(filters[i], 0.5); // Threshold with 0.5
//     } else if (filters[i] === BLUR) {
//       g.filter(filters[i], 5); // Blur with radius 5
//     } else {
//       g.filter(filters[i]);
//     }

//     gridGraphics.push({ g, x, y });
//   }
//   g2 = createGraphics(cellWidth, cellHeight);
//   g2.noStroke();
//   g2.background(220, 20, 60); // Crimson background
//   g2.fill(255); // White asterisk
//   g2.textAlign(CENTER, CENTER);
//   g2.textSize(cellHeight * 2);
//   g2.text("*", cellWidth / 2, cellHeight);
// }

// function draw() {
//   background(220);

//   // Draw the grid graphics
//   for (let i = 0; i < gridGraphics.length; i++) {
//     let { g, x, y } = gridGraphics[i];
//     image(g, x, y);
//   }
//   tint(255, 255, 0, 150);
//   image(g2, cellHeight * 2, cellHeight * 2);
// }


// function setup() {
//   createCanvas(400, 400);
//   colorMode(HSB, 360, 100, 100);
//   noStroke();
// }

// function draw() {
//   background(0);
//   for (let x = 0; x <= width; x += 20) {
//     for (let y = 0; y <= height; y += 20) {
//       fill((frameCount + x + y) % 360, 100, 100);
//       ellipse(x, y, 15, 15);
//     }
//   }
// }

// function setup() {
//   createCanvas(400, 400);
// }

// function draw() {
// let c = color(255, 204, 0, 128);
// let a = alpha(c);
// print(a);  // Prints "128"

// let c2 = '#9cd10b'
// let g = green(c2);
// print(g);
// }

