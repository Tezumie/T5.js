function setup() {
  const resolution = 1.5;  // Increase this value for higher pixelation
  const canvas = createCanvas(window.innerWidth, window.innerHeight);

  // Load the pixels array.
  const imageData = drawingContext.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let cols = floor(width / resolution);
  let rows = floor(height / resolution);
  let increment = 0.1;
  let zoff = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let angle = noise(x * increment, y * increment, zoff) * PI * 2;
      let vx = cos(angle) * 10;
      let vy = sin(angle) * 10;
      let xPos = floor(x * resolution);
      let yPos = floor(y * resolution);
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          let pixelIndex = 4 * ((xPos + i) + (yPos + j) * width);
          data[pixelIndex] = vx * 25.5; 
          data[pixelIndex + 1] = vy * 25.5; 
          data[pixelIndex + 2] = 255;
          data[pixelIndex + 3] = 255;
        }
      }
    }
    zoff += 0.01;
  }
  
  //Update Pixels
  drawingContext.putImageData(imageData, 0, 0);
}
