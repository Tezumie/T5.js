function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(0);
  for (let x = 0; x <= width; x += 20) {
    for (let y = 0; y <= height; y += 20) {
      fill((frameCount + x + y) % 360, 100, 100);
      ellipse(x, y, 15, 15);
    }
  }
}

