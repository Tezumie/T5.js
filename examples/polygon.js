let aspectRatio = 5 / 3;

function setup() {
    createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
    flexibleCanvas(1000);
}

function draw() {
    background(220);

    fill(0, 119, 255)
    borderRadius(30)
    polygon(100, 100, 100, 3) //(x,y,radius,vertex count)

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

    borderRadius(30)
    star(900, 300, 100, 30, 4)

    borderRadius(0)
    star(100, 500, 100, 50, 5) //(x,y,radius,inner radius,vertex count)

    borderRadius(20)
    star(300, 500, 100, 70, 6)

    borderRadius(0)
    star(500, 500, 100, 40, 7)
    star(700, 500, 100, 70, 8)
    star(900, 500, 100, 20, 9)
}