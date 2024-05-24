let aspectRatio = 3 / 4;

function setup() {
  createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
  // Scale all drawing operations automatically to any window size
  dimensionAgnostic(true, 1000); // Canvas is 1000 units wide
}

function draw() {
  background(220);
  rect(0, 0, 500) // 500x500 units is half the width 
}
