let aspectRatio = 3 / 4;
let mysound;
function preload() {
  mysound = loadSound('dev/coin_pickup.wav')
}
function setup() {
  createCanvas(window.innerWidth, window.innerWidth / aspectRatio);
  mysound.setVolume(0.1);
  mysound.loop();
}

function draw() {
//  mysound.stop();
}
