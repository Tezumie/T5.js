let mode = 'HSB';
let modes = ['RGB', 'HSB', 'HSL'];
let modeIndex = 0;

function setup() {
    createCanvas(400, 400);
    colorMode(HSB, 360, 100, 100); // Start with HSB mode
    noStroke();
}

function draw() {
    background(0);
    for (let x = 0; x <= width; x += 20) {
        for (let y = 0; y <= height; y += 20) {
            if (mode === 'RGB') {
                fill((frameCount + x + y) % 256, 100, 150);
            } else if (mode === 'HSB') {
                fill((frameCount + x + y) % 360, 100, 100);
            } else if (mode === 'HSL') {
                fill((frameCount + x + y) % 360, 100, 50);
            }
            ellipse(x, y, 15, 15);
        }
    }
}

function keyPressed() {
    modeIndex = (modeIndex + 1) % modes.length;
    mode = modes[modeIndex];
    if (mode === 'RGB') {
        colorMode(RGB, 255, 255, 255);
    } else if (mode === 'HSB') {
        colorMode(HSB, 360, 100, 100);
    } else if (mode === 'HSL') {
        colorMode(HSL, 360, 100, 100);
    }
    console.log(`Color mode changed to: ${mode}`);
}
