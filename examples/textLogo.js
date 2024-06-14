let aspectRatio = 1.33;

function setup() {
    createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
    flexibleCanvas(1430); // canvas is 1000 units wide
}

function draw() {
    background('#121212');
    noStroke();
    fill('#917eff');
    textStyle('bold');
    textSize(400);
    textAlign('center', 'center');
    textFont('Helvetica');

    text('T', 340, 700);
    text('5', 550, 700);
    fill('#d0ff00');
    text('J', 860, 700);
    text('S', 1090, 700);

    fill('#ffffff');
    textSize(300);
    textFont('Times New Roman');
    text('*', 750, 640);
}


// let aspectRatio = 1.33;

// function setup() {
//     createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
//     flexibleCanvas(1400); // canvas is 1000 units wide
// }

// function draw() {
//     background('#091725');
//     noStroke();
//     fill('#3377bb');
//     textStyle('bold');
//     textSize(400);
//     textAlign('center', 'center');
//     // textFont('Helvetica');

//     text('p', 330, 620);
//     text('5', 540, 620);
//     fill('#ffbb33');
//     text('p', 890, 620);
//     text('y', 1090, 620);

//     textSize(300);
//     fill('#ffffff');
//     // textFont('Times New Roman');
//     text('*', 720, 750);
// }
