let aspectRatio = 3 / 4;

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
    flexibleCanvas(1000);
    noLoop();
    strokeWeight(3)
    background(255)
    fill(color(255, 150))
}

function draw() {
    ellipse(0, 0, 300);
    ellipse(width / 2, height / 5, width / 1.5);
    ellipse(width / 2, height, width / 1.5);
    ellipse(0, height / 1.7, width / 1.2);
    ellipse(width, height / 3, width / 2);

    fillArea(203, 5, color(2, 115, 214));
    fillArea(width / 2, height / 2, color(66, 214, 29));
    fillArea(width - 5, 5, color(214, 29, 29));
    fillArea(5, height - 10, color(253, 216, 6));
}