let ground, yellowBlock, blueBlock, player, tileMap, spawnedObjectsGroup, ball, joint

function setup() {
  createCanvas(160, 100)
  pixelDensity(10) //render scale
  // noSmooth()

  world.gravity = { x: 0, y: 50 }
  world.camera.lag = 0.1

  ground = new PhysicsGroup()
  ground.id = "G"
  ground.type = "static"
  ground.width = 8
  ground.height = 8

  yellowBlock = new PhysicsGroup()
  yellowBlock.id = "R"
  yellowBlock.fill = color(255, 217, 0, 30)
  yellowBlock.stroke = "rgba(255, 217, 0, 0.83)"
  yellowBlock.type = "static"
  yellowBlock.width = 8
  yellowBlock.height = 8

  blueBlock = new PhysicsGroup()
  blueBlock.id = "B"
  blueBlock.fill = color(0, 110, 255, 30)
  blueBlock.stroke = "rgba(0, 110, 255, 0.83)"
  blueBlock.type = "Kinematic"
  blueBlock.width = 8
  blueBlock.height = 8

  const mapData = [
    "G.........................G.............", //First Line will be in top left corner
    "G.........................R.............",
    "G.......R....R..R..BB.....R.............",
    "G......RB.................R.............",
    "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  ]

  tileMap = new TileMap(8, mapData)

  player = new Body(16, 4, 7.5, {
    type: "dynamic",
    borderRadius: 2,
    fill: "#cccccca6",
    originalColor: "#cccccca6", //Custom attr
    restitution: 0.05,
    //fixedRotation: true, //planck attribute
  })

  ball = new Body(4, 0, 7.5, {
    type: "dynamic",
    shape: "ellipse",
    fill: "#91ff0057",
    restitution: 0.9, //bounces
    // gravityScale: -0.5, //floats
  })

  joint = new Joint("RopeJoint", player, ball, {
    length: 25,
    maxLength: 40,
    frequencyHz: 5,
    dampingRatio: 0.7,
    collideConnected: true, //the connected bodies can hit eachother
  })

  spawnedObjectsGroup = new PhysicsGroup()
  spawnedObjectsGroup.id = "Spawned"
  spawnedObjectsGroup.type = "dynamic"

  world.camera.follow(player, 0, -16)
  backgroundGrid(8)
}

function draw() {
  clear()
  // background(1, 18, 255)

  // Reset colors for ground group
  for (const body of ground.bodies) {
    body.fill = ground.fill
  }

  //player.fill = player.originalColor

  // Use collision callbacks or isColliding sparingly due to performance:
  world.isColliding((a, b) => {
    // Only color red if one is the player and the other belongs to the ground group
    if ((a === player && b.group === ground) || (b === player && a.group === ground)) {
      a.fill = "#00eeff63"
      //b.fill = "#00ffea" //color player when on ground
    }
  })

  for (const body of spawnedObjectsGroup.bodies) {
    if (player.isColliding(body)) {
      body.fill = "#ff00229d" // Turn the colliding object red
      body.stroke = "#ff0022"
    } else {
      body.fill = body.originalColor // Reset to original color if not colliding
      body.stroke = body.originalStroke
    }
  }

  handlePlayerMovement()

  fill(102, 255, 72, 20)
  stroke("#bababa3d")
  strokeWeight(0.25)
  ellipse(mouseX, mouseY, 16, 16)

  noStroke()
  fill("#bababa")
  textSize(5)
  text("FPS: " + frameRate().toFixed(2), 2, 6)

  // joint.debug()
  // world.debug(world.bodies)
  // world.debug(spawnedObjectsGroup)
  // rect(4,4,8)
}

function postProcess() {
  // Optional post-processing
  rect(world.x + 4, world.y + 4, 8)

  //draw Joint
  stroke(255, 187, 0)
  strokeWeight(0.5)
  line(player.position.x, player.position.y, ball.position.x, ball.position.y)
  noStroke()
}

function handlePlayerMovement() {
  const velocity = player.vel
  if (keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) {
    player.vel = { x: -25, y: velocity.y }
    player.mirrorX = -1
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) {
    player.vel = { x: 25, y: velocity.y }
    player.mirrorX = 1
  } else {
    player.vel = { x: 0, y: velocity.y }
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(SPACE) || keyIsDown(KEY_W)) {
    if (player.isGrounded(ground, yellowBlock, spawnedObjectsGroup)) {
      player.vel = { x: velocity.x, y: -40 }
    }
  }
}

function mousePressed() {
  spawnRandomBody(mouseX, mouseY)
}

function spawnRandomBody(x, y) {
  let size = random([6, 8, 10, 12])
  let col = color(72, 145, 255, 100)
  let str = "#bababa"
  spawnedObjectsGroup.add(x, y, size, {
    originalStroke: str,
    originalColor: col, //this is a custom attribute
    type: "dynamic",
    shape: "polygon",
    sides: random([3, 4, 5, 6, 7, 8]),
    // restitution: 1//bounciness
  })
}

// let gridGraphics = [];
// let g2;
// let cellHeight;

// function setup() {
//   createCanvas(window.innerWidth, window.innerWidth);
//   noStroke();
//   noLoop();
//   pixelDensity(2)

//   // Define filters to apply
//   let filters = [GRAY, INVERT, THRESHOLD, POSTERIZE, BLUR, ERODE, DILATE, OPAQUE]

//   // Create graphics with different filters
//   let cols = 3;
//   let rows = 3;
//   let cellWidth = width / cols;
//   cellHeight = height / rows;

//   for (let i = 0; i < filters.length; i++) {
//     let x = (i % cols) * cellWidth;
//     let y = Math.floor(i / cols) * cellHeight;

//     let g = createGraphics(cellWidth, cellHeight);
//     g.noStroke();
//     g.background(220, 20, 60); // Crimson background
//     g.fill(255); // White asterisk
//     g.textAlign(CENTER, CENTER);
//     g.textSize(cellHeight * 2);
//     g.text("*", cellWidth / 2, cellHeight);

//     // Apply filter
//     if (filters[i] === POSTERIZE) {
//       g.filter(filters[i], 5); // Posterize with level 5
//     } else if (filters[i] === THRESHOLD) {
//       g.filter(filters[i], 0.5); // Threshold with 0.5
//     } else if (filters[i] === BLUR) {
//       g.filter(filters[i], 5); // Blur with radius 5
//     } else {
//       g.filter(filters[i]);
//     }

//     gridGraphics.push({ g, x, y });
//   }
//   g2 = createGraphics(cellWidth, cellHeight);
//   g2.noStroke();
//   g2.background(220, 20, 60); // Crimson background
//   g2.fill(255); // White asterisk
//   g2.textAlign(CENTER, CENTER);
//   g2.textSize(cellHeight * 2);
//   g2.text("*", cellWidth / 2, cellHeight);
// }

// function draw() {
//   background(220);

//   // Draw the grid graphics
//   for (let i = 0; i < gridGraphics.length; i++) {
//     let { g, x, y } = gridGraphics[i];
//     image(g, x, y);
//   }
//   tint(255, 255, 0, 150);
//   image(g2, cellHeight * 2, cellHeight * 2);
// }


// function setup() {
//   createCanvas(400, 400);
//   colorMode(HSB, 360, 100, 100);
//   noStroke();
// }

// function draw() {
//   background(0);
//   for (let x = 0; x <= width; x += 20) {
//     for (let y = 0; y <= height; y += 20) {
//       fill((frameCount + x + y) % 360, 100, 100);
//       ellipse(x, y, 15, 15);
//     }
//   }
// }

// function setup() {
//   createCanvas(400, 400);
// }

// function draw() {
// let c = color(255, 204, 0, 128);
// let a = alpha(c);
// print(a);  // Prints "128"

// let c2 = '#9cd10b'
// let g = green(c2);
// print(g);
// }

