let aspectRatio = 5 / 3;

function setup() {
  createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
  flexibleCanvas(1000);
}

function draw() {
  background(220);

  fill(0, 119, 255)
  borderRadius(10)
  polygon(100, 100, 100, 3) //3 vertex regular polygon

  fill(255, 0, 0)
  borderRadius(30, 0, 30, 0) //curve vertex in order
  polygon(300, 100, 100, 4)

  fill(255, 230, 0)
  borderRadius(0)
  polygon(500, 100, 100, 5)

  fill(30, 255, 0)
  borderRadius(0, 10, 30, 50, 30, 10)
  polygon(700, 100, 100, 6)

  fill(255, 255, 255)
  borderRadius(0)
  polygon(900, 100, 100, 7)
  polygon(100, 300, 100, 8)
  polygon(300, 300, 100, 9)
  polygon(500, 300, 100, 10)
  polygon(700, 300, 100, 11)
  polygon(900, 300, 100, 12)
  polygon(100, 500, 100, 13)
  polygon(300, 500, 100, 14)
  polygon(500, 500, 100, 15)
  polygon(700, 500, 100, 16)
  polygon(900, 500, 100, 17)
}