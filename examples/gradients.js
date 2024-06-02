let aspectRatio = 5 / 1;

function setup() {
    createCanvas(windowWidth, windowWidth / aspectRatio);
    flexibleCanvas(1000)
    background(255, 255, 255)
}

function draw() {

    stroke(0)
    strokeWeight(0)
    gradientFill('#ff0000', '#0000ff', 0, width / 2, width / 2, height / 2);
    rect(0, 0, 200)

    dynamicFill('linear', [
        { offset: 0, color: '#ff0000' },
        { offset: 0.5, color: '#00ff00' },
        { offset: 1, color: '#0000ff' }
    ], 300, 0, 200, 200);
    rect(200, 0, 200)


    dynamicFill('radial', [
        { offset: 0, color: '#0051ff' },
        { offset: 0.4, color: '#c8ff00' },
        { offset: 0.95, color: '#ff00aa' }
    ], 500, 100, 150);
    rect(400, 0, 200)


    strokeWeight(20)
    dynamicStroke('linear', [
        { offset: 0, color: '#ff0000' },
        { offset: 0.5, color: '#00ff00' },
        { offset: 1, color: '#0000ff' }
    ], 800, 10, 200, 200);
    radialFill('#000000', '#ff0000', 700, 100, 120);

    rect(610, 10, 180)

    fill(0)
    gradientStroke('#fffb00', '#ff00ea', width / 2, 0, width / 2, height / 2);
    rect(810, 10, 180)
}
