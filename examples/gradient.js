function setup() {
    const squareSize = 300;
    const strokeWidth = 30;
    const totalWidth = (squareSize + strokeWidth) * 5;
    const totalHeight = squareSize + strokeWidth;
    createCanvas(totalWidth, totalHeight);
}

function draw() {
    const squareSize = 300;
    const strokeWidth = 30;
    const startY = strokeWidth / 2;
    const spacing = squareSize + strokeWidth;

    // Define the gradient stroke weight
    strokeWeight(strokeWidth);
    borderRadius(squareSize / 3)
    // Square 1: Linear gradient from left to right
    gradientFill(LINEAR, [
        { startX: 0, startY: 0, endX: squareSize, endY: 0 },
        { colorStop: 0, color: '#ff0000' },
        { colorStop: 1, color: '#0000ff' }
    ]);
    gradientStroke(LINEAR, [
        { startX: 0, startY: 0, endX: squareSize, endY: 0 },
        { colorStop: 0, color: '#88ff00' },
        { colorStop: 1, color: '#00fff2' }
    ]);
    rect(strokeWidth / 2, startY, squareSize, squareSize);

    // Square 2: Linear gradient from top to bottom
    gradientFill(LINEAR, [
        { startX: 0, startY: 0, endX: 0, endY: squareSize },
        { colorStop: 0, color: '#07ff8b' },
        { colorStop: 1, color: '#cf06cf' }
    ]);
    gradientStroke(LINEAR, [
        { startX: 0, startY: 0, endX: 0, endY: squareSize },
        { colorStop: 0, color: '#eeff00' },
        { colorStop: 1, color: '#ff00ff' }
    ]);
    rect(strokeWidth / 2 + spacing, startY, squareSize, squareSize);

    // Square 3: Radial gradient from center to edges
    gradientFill(RADIAL, [
        { startX: 2 * spacing + squareSize / 2, startY: startY + squareSize / 2, radius: squareSize / 2 },
        { colorStop: 0, color: '#ff0000' },
        { colorStop: 1, color: '#ffff00' }
    ]);
    gradientStroke(RADIAL, [
        { startX: 2 * spacing + squareSize / 2, startY: startY + squareSize / 2, radius: squareSize * 1.1 },
        { colorStop: 0, color: '#1900ff' },
        { colorStop: 1, color: '#ffffff' }
    ]);
    rect(strokeWidth / 2 + 2 * spacing, startY, squareSize, squareSize);

    // Square 4: Linear gradient diagonal from top-left to bottom-right
    gradientFill(LINEAR, [
        { startX: 3 * spacing, startY: 0, endX: 3 * spacing + squareSize, endY: squareSize },
        { colorStop: 0, color: '#0000ff' },
        { colorStop: 1, color: '#00ffff' }
    ]);
    gradientStroke(LINEAR, [
        { startX: 3 * spacing, startY: 0, endX: 3 * spacing + squareSize, endY: squareSize },
        { colorStop: 0, color: '#00ffff' },
        { colorStop: 1, color: '#0000ff' }
    ]);
    rect(strokeWidth / 2 + 3 * spacing, startY, squareSize, squareSize);

    // Square 5: Radial gradient from center to edges
    gradientFill(RADIAL, [
        { startX: 4 * spacing + squareSize / 2, startY: startY + squareSize / 2, radius: squareSize / 2 },
        { colorStop: 0, color: '#ff00ff' },
        { colorStop: 1, color: '#00ff00' }
    ]);
    gradientStroke(RADIAL, [
        { startX: 4 * spacing + squareSize / 2, startY: startY + squareSize / 2, radius: squareSize },
        { colorStop: 0, color: '#000000' },
        { colorStop: 1, color: '#00ff00' }
    ]);
    rect(strokeWidth / 2 + 4 * spacing, startY, squareSize, squareSize);
}
