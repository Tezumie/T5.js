let aspectRatio = 1 / 1;
let textureImg;

function preload() {
  textureImg = loadImage('cover.png'); // add an image to set a shapes texture
}

function setup() {
  createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
  flexibleCanvas(800);
  background('#000000');

  // Make custom Textures
  // Create an offscreen buffer 1
  const buffer1 = createBuffer(window.innerWidth, window.innerWidth);

  drawToBuffer(buffer1); //Make all drawing operations go to buffer1

  // Draw a pattern on buffer1
  fill('#ff0000');
  for (let y = 0; y < 800; y += 40) {
    for (let x = 0; x < 800; x += 40) {
      rect(x + 5, y + 5, 30);
    }
  }

  // Create an offscreen buffer 2
  const buffer2 = createBuffer(window.innerWidth, window.innerWidth);
  drawToBuffer(buffer2); //Make all drawing operations go to buffer2

  // Draw a pattern on buffer2
  fill('#00ff00');
  borderRadius(14)
  for (let y = 0; y < 800; y += 80) {
    for (let x = 0; x < 800; x += 80) {
      rect(x + 5, y + 5, 60);
    }
  }

  drawToCanvas(); // Draw the main canvas, this will make future drawing operations draw to the main canvas
  //viewBuffer(buffer1) // If you want to view your buffer drawing , make sure you use drawtoCanvas to see it
  borderRadius(0);

  // Use buffer1 as a texture for a shape on the main canvas
  setTexture(buffer1.buffer);
  stroke('#e40000');
  strokeWeight(3);
  rect(3, 3, 200);

  // Use buffer2 as a texture for a shape on the main canvas
  setTexture(buffer2.buffer);
  stroke('#6ee400');
  rect(206, 3, 200);

  // Draw a third shape with an image texture
  noFill(); //optionally disable the texture fill
  setTexture(textureImg, 'cover'); // your image from the preload function
  stroke('#ffffff');
  borderRadius(30, 0, 30, 0);
  strokeWeight(3);
  rect(409, 3, 200);

}