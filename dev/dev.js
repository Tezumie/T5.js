let aspectRatio = 5 / 1;

function setup() {
    createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
    flexibleCanvas(1000);
}

function draw() {
    background(220);
    rectMode(CENTER)

    fill(0, 119, 255)
    borderRadius(20)
    innerBorderRadius(20)
    hollowPolygon(100, 100, 100, 5, 50)

    fill(255, 0, 0)
    borderRadius(30, 0, 30, 0)
    innerBorderRadius(20, 0, 20, 0)
    hollowRect(300, 100, 120, 120, 30)

    fill(255, 230, 0)
    borderRadius(30)
    innerBorderRadius(10)
    hollowStar(500, 100, 100, 50, 5, 50, 30)

    fill(30, 255, 0)
    borderRadius(0)
    innerBorderRadius(0)
    hollowEllipse(700, 100, 150, 150, 50)

    fill(255, 93, 161)
    borderRadius(20, 0, 10, 0, 30)
    innerBorderRadius(5)
    beginShape()
    vertex(800, 100)
    vertex(900, 20)
    vertex(950, 100)
    vertex(950, 150)
    vertex(850, 170)

    innerVertex(850, 100)
    innerVertex(900, 70)
    innerVertex(930, 130)
    innerVertex(860, 150)
    innerVertex(880, 130)
    endShape(CLOSE)

}