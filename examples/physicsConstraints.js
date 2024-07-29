let balls;
let constraints;
let numBalls = 5;
let ballRadius = 30;
let stringLength = 250;
let draggingBall = null;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    flexibleCanvas(800);
    worldGravity(2.0);
    balls = new PhysicsGroup(); // create groups to manage physics objects
    constraints = new PhysicsGroup();
    let startX = width / 2 - ((numBalls - 1) * ballRadius);
    frameRate(60);

    for (let i = 0; i < numBalls; i++) {
        let x = startX + i * (ballRadius * 2);
        let y = height / 1.5;

        let ball = physicsEllipse(x, y, ballRadius * 2);
        ball.restitution = 1.15; // Ball bounciness
        ball.fill = color('#14151f69'); // Use color function
        ball.stroke = '#bababa';
        ball.width = 5;
        ball.hit = 0; // create custom property for a timer
        balls.add(ball);

        let anchor = { x: x, y: y - stringLength };
        let constraint = createConstraint(ball.body, anchor, { length: stringLength, stiffness: 0.2, damping: 0.2 });
        constraints.add(constraint);
    }

    // Pull the first ball to the left
    balls[0].setPosition(balls[0].x - 150, balls[0].y - 50);
}

function draw() {
    background('#14151f');

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        let constraint = constraints[i];

        // Adjust constraint stiffness and damping based on distance (springy rope)
        let distance = dist(ball.x, ball.y, constraint.pointB.x, constraint.pointB.y);
        if (distance > stringLength) {
            constraint.stiffness = 0.2;
            constraint.length = stringLength;
            constraint.damping = 0.2; // Increase damping to reduce oscillations
        } else {
            constraint.stiffness = 0.000001;
            constraint.damping = 0.000005; // Decrease damping to allow more oscillations
        }

        // Calculate stroke color based on distance
        let maxDistance = stringLength * 1.5;
        let minDistance = 50;
        let colorFactor = map(distance, minDistance, maxDistance, 0, 1.5);
        let strokeColor = lerpColor(color(0, 255, 255), color(255, 200, 0), colorFactor);
        let fillColor = lerpColor(color(0, 255, 255, 50), color(255, 200, 0, 100), colorFactor);

        constraint.fill = '#14151f';
        constraint.stroke = strokeColor;
        constraint.width = 6;
        constraint.borderRadius = [0, 3, 3, 0];

        // Update ball color based on hit timer
        if (ball.hit > 0) {
            ball.hit--;
            ball.fill = lerpColor(fillColor, color(255, 0, 0, 100), ball.hit / frameRate()); // Adjust 60 to change duration
        } else {
            ball.fill = fillColor;
        }

        ball.stroke = strokeColor;
    }

    // Check collisions and update hit timer
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[i].collidesWith(balls[j])) {
                balls[i].hit = frameRate(); // Set hit timer to 60 frames
                balls[j].hit = frameRate(); // Set hit timer to 60 frames
            }
        }
    }

    fill(170, 170, 170, 10);
    stroke(255, 50);
    ellipse(mouseX, mouseY, 60);

    // Update physics world
    updatePhysics();
}

function mousePressed() {
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        let d = dist(mouseX, mouseY, ball.x, ball.y);
        if (d < ballRadius) {
            draggingBall = ball;
            break;
        }
    }
}

function mouseDragged() {
    if (draggingBall) {
        draggingBall.moveTo(mouseX, mouseY);
    }
}

function mouseReleased() {
    draggingBall = null;
}
