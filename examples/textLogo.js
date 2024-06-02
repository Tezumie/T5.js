let aspectRatio = 1 / 1;

function setup() {
    createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
    flexibleCanvas(1000); // canvas is 1000 units wide
}

function draw() {
    background('#8947d8');
    noStroke();
    fill(255);

    textSize(400);
    textAlign('center', 'center');
    textFont('Helvetica');

    text('T', 140, 650);
    text('5', 350, 650);

    text('J', 660, 650);
    text('S', 860, 650);

    textSize(300);
    textFont('Times New Roman');
    text('*', 550, 590);
}