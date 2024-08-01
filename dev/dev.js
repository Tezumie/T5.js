let aspectRatio = 3 / 4;
let colors = [
  "#f5c851", "#63a48e", "#f2eac3", "#e73427", "#0e7395", "#efd1b5", "#559b88",
  "#f33f32", "#f2d692", "#2597a4", "#e56c30", "#242829", "#5483a8", "#0d455b",
  "#efe8cf", "#3e6078", "#1e2224",
];
let rectangles = [];
let originalImageData;
let canvasWidth, canvasHeight;
let gridSize;

function setup() {
  let maxWith = 1280;
  if (window.innerWidth < 1280) {
    maxWith = window.innerWidth;
  }
  createCanvas(Math.floor(maxWith * aspectRatio), floor(maxWith));
  flexibleCanvas(600);
  gridSize = Math.floor(maxWith * aspectRatio / 170);
  pixelDensity(1);
  randomSeed(1223412131);
  noiseSeed(42224);
  canvasWidth = Math.floor(maxWith * aspectRatio) * pixelDensity();
  canvasHeight = Math.floor(maxWith) * pixelDensity();

  for (let i = 0; i < 500; i++) {
    rectangles.push({
      x: random(-100, width),
      y: random(-100, height),
      w: random(30, 150),
      h: random(30, 150),
      fillColor: random(colors),
      strokeColor: random(colors),
    });
  }

  drawInitialImage();
  loadPixels();
  originalImageData = pixels.slice(); // Copy the pixel data
  frameRate(30);
}

function drawInitialImage() {
  background(0);
  rect(0, 0, width, height);
  strokeWeight(12);

  for (let rectangle of rectangles) {
    if (random() > 0.00) {
      fill(rectangle.fillColor);
      stroke(rectangle.strokeColor);
    } else {
      gradientFill(rectangle.strokeColor, rectangle.fillColor,
        rectangle.x, rectangle.y, rectangle.x + rectangle.w, rectangle.y + rectangle.h);
      gradientStroke(rectangle.fillColor, rectangle.strokeColor,
        rectangle.x + rectangle.w, rectangle.y + rectangle.h, rectangle.x, rectangle.y);
    }
    rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
  }
}

function draw() {
  clear();
  loadPixels();
  pixels.set(originalImageData); // Restore the original image data
  addDistortionEffect();
  updatePixels();
}

function addDistortionEffect() {
  const distortionAmount = 2 + 5 * Math.sin(frameCount * 0.00000081);
  const noiseScale = 1.8;
  const timeFactor = frameCount * 0.030;

  const distortionGrid = createDistortionGrid(canvasWidth, canvasHeight, gridSize, distortionAmount, noiseScale, timeFactor);

  for (let j = 0; j < canvasHeight; j++) {
    for (let i = 0; i < canvasWidth; i++) {
      const { x, y } = normalizeCoordinates(i, j, canvasWidth, canvasHeight);
      const distorted = interpolateDistortion(x, y, distortionGrid, gridSize, canvasWidth, canvasHeight);
      const { newX, newY } = distorted;
      const { i: newI, j: newJ } = denormalizeCoordinates(newX, newY, canvasWidth, canvasHeight);

      const srcX = Math.floor(constrain(newI, 0, canvasWidth - 1));
      const srcY = Math.floor(constrain(newJ, 0, canvasHeight - 1));
      const srcIdx = (srcY * canvasWidth + srcX) * 4;
      const destIdx = (j * canvasWidth + i) * 4;

      pixels[destIdx] = originalImageData[srcIdx];
      pixels[destIdx + 1] = originalImageData[srcIdx + 1];
      pixels[destIdx + 2] = originalImageData[srcIdx + 2];
      pixels[destIdx + 3] = originalImageData[srcIdx + 3];
    }
  }
}

function createDistortionGrid(width, height, size, amount, scale, time) {
  const grid = [];
  for (let y = 0; y < height; y += size) {
    const row = [];
    for (let x = 0; x < width; x += size) {
      const { x: normX, y: normY } = normalizeCoordinates(x, y, width, height);
      const noiseValue = noise(normX * scale, normY * scale, time);
      const noiseValue2 = noise(normX * scale * 1.5, normY * scale * 1.5, time * 0.5);
      const angle = noiseValue * TWO_PI;
      const radius = noiseValue2 * amount;
      const newX = normX + Math.cos(angle) * radius;
      const newY = normY + Math.sin(angle) * radius;
      row.push({ newX, newY });
    }
    grid.push(row);
  }
  return grid;
}

function interpolateDistortion(x, y, grid, size, width, height) {
  const normX = (x + 1) * 0.5 * width;
  const normY = (y + 1) * 0.5 * height;
  const gridX = Math.floor(normX / size);
  const gridY = Math.floor(normY / size);
  const gridXNext = Math.min(gridX + 1, grid[0].length - 1);
  const gridYNext = Math.min(gridY + 1, grid.length - 1);

  const distX = (normX % size) / size;
  const distY = (normY % size) / size;

  const topLeft = grid[gridY][gridX];
  const topRight = grid[gridY][gridXNext];
  const bottomLeft = grid[gridYNext][gridX];
  const bottomRight = grid[gridYNext][gridXNext];

  const newX = lerp(lerp(topLeft.newX, topRight.newX, distX), lerp(bottomLeft.newX, bottomRight.newX, distX), distY);
  const newY = lerp(lerp(topLeft.newY, topRight.newY, distX), lerp(bottomLeft.newY, bottomRight.newY, distX), distY);

  return { newX, newY };
}

function normalizeCoordinates(i, j, width, height) {
  const x = (i / width) * 2 - 1;
  const y = (j / height) * 2 - 1;
  return { x, y };
}

function denormalizeCoordinates(x, y, width, height) {
  const i = ((x + 1) / 2) * width;
  const j = ((y + 1) / 2) * height;
  return { i, j };
}
