let mouseShape
function setup() {
    createCanvas(window.innerWidth, window.innerWidth);
    flexibleCanvas(800)//makes the project dimension agnostic

    // Make some random shapes
    for (let i = 0; i < 30; i++) {
        let shapes = random(['ellipse', 'rect', 'polygon'])
        if (shapes == 'ellipse') {
            shapes = physicsEllipse(random(width), random(height / 2), random(50, 100));
        }
        else if (shapes == 'rect') {
            shapes = physicsRect(random(width), random(height / 2), random(50, 100), random(30, 50));
        } else {
            shapes = physicsPolygon(random(width), random(height / 2), 50, int(random(3, 7)));
        }
        shapes.fill = '#14151f69'
        shapes.stroke = '#bababa'
        shapes.borderRadius = int(random(0, 6))
        shapes.debug = true
    }

    // Add static rectangles for boundaries
    physicsRect(width / 2, 0, width, 40, {
        isStatic: true,
        fill: '#14151f69',
        stroke: '#bababa'
    });
    physicsRect(0, height / 2, 40, height, {
        isStatic: true,
        fill: '#14151f69',
        stroke: '#bababa'
    });
    physicsRect(width, height / 2, 40, height, {
        isStatic: true,
        fill: '#14151f69',
        stroke: '#bababa'
    });
    let floor = physicsRect(width / 2, height, width, 40, {
        isStatic: true
    });
    floor.fill = color(72, 145, 255, 143)
    floor.stroke = '#bababa'
    worldGravity(1.5);

    // Mouse object
    mouseShape = physicsEllipse(width / 2, height / 2, 70)
}

function draw() {
    background('#14151f');
    updatePhysics();

    // Display the number of objects
    fill('#bababa');
    noStroke()
    textSize(20);
    text(`Objects: ${physicsObjects.length}`, 40, 50);

    fill('#14151f69');
    stroke('#bababa62')
    //Follow the mouse
    mouseShape.moveTo(mouseX, mouseY, 0.5);
}

function mousePressed() {
    // Add a new irregular shape at the mouse position when clicked
    physicsBeginShape();
    let numVertices = int(random(3, 9));
    for (let i = 0; i < numVertices; i++) {
        let angle = TWO_PI / numVertices * i;
        let x = mouseX + cos(angle) * random(20, 70);
        let y = mouseY + sin(angle) * random(20, 70);
        physicsVertex(x, y);
    }
    let shape = physicsEndShape();
    shape.fill = color(102, 255, 72, 103)
    shape.stroke = '#bababa'
    shape.debug = true

    //Add a polygon at mouse position
    shape = physicsPolygon(mouseX, mouseY, 50, int(random(3, 7)));
    shape.debug = true
    shape.fill = color(72, 145, 255, 103)
    shape.stroke = '#bababa'
}