// let angle = 0;
// function setup() {
//     createCanvas(1400, 1400);
//     angle = (3.1415926535 / 4);
//     strokeWeight(3);
//     stroke('#008709');

// }
// function draw() {
//     background('#ffffff');
//     translate((width / 2), height);
//     branch(400);
// }
// function branch(len) {
//     line(0, 0, 0, (len * -1));
//     translate(0, (len * -1));
//     if((len > 4)){
//         push();
//         rotate(angle);
//         branch((len * 0.67));
//         pop();
//         push();
//         rotate((angle * -1));
//         branch((len * 0.67));
//         pop();
//     }
//     else{
//         return ;
//     }
// }

let img, Canvas;

function setup() {
    Canvas = createCanvas(800, 800);
    background(255);
    noLoop();
}

function draw() {
    createSimplePattern();
    createPattern();

    background(255);

    // Draw and clip the pattern to a rectangle
    rect(width / 2 - width / 4, 0, width / 2, height / 2);
    beginPattern();
    image(img, 0, 0);
    endPattern();

    // Draw and clip the pattern to an ellipse
    ellipse(width / 2, height - width / 4, width / 2);
    beginPattern();
    image(img, 0, 0);
    endPattern();
}

function createPattern() {
    img = createGraphics(width, height);
    img.copy(Canvas, 0, 0, width, height, 0, 0, img.width, img.height);
    clear();
}

function beginPattern() {
    drawingContext.save();
    drawingContext.clip();
}

function endPattern() {
    drawingContext.restore();
}

function createSimplePattern() {
    stroke(0);
    strokeWeight(2);
    for (let x = 0; x < width; x += 20) {
        for (let y = 0; y < height; y += 20) {
            line(x, y, x + 10, y + 10);
            line(x + 10, y, x, y + 10);
        }
    }
}

