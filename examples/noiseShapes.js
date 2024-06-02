let aspectRatio = 3 / 4;

function setup() {
    createCanvas(windowWidth, windowWidth / aspectRatio);
    flexibleCanvas(1000)
}

function draw() {
    background(29, 108, 255);
    strokeWeight(12);

    noFill();
    noiseLine(100, 100, 700, 500, 0.1, 50);

    fill(211, 29, 29)
    noiseEllipse(width / 2, height / 2, 200, 200, 0.1, 20)

    fill(255, 251, 0)
    noiseRect(width / 2, height - 500, 400, 400, 0.1, 10)

}

