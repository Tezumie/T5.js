
window.decomp = {
    makeCCW: function (vertices) { return vertices; },
    removeCollinearPoints: function (vertices) { return vertices; },
    quickDecomp: function (vertices) { return [vertices]; },
    isSimple: function () { return true; },
    isConvex: function (vertices) { return true; }
};

T5.addOns.physics = ($, p, globalScope) => {
    $.inverseScaleT5Coord = function (coord) {
        if (!$.canvas) {
            return;
        }
        if (!$.dimensionUnit) {
            $.dimensionUnit = $.canvas.width / $.t5PixelDensity;
        }
        return (coord * $.dimensionUnit) / ($.canvas.width / $.t5PixelDensity);
    };

    $.inverseScaleT5Coords = function (coords) {
        return coords.map(coord => $.inverseScaleT5Coord(coord));
    };

    const matterNotLoadedWarning = () => {
        console.warn("Matter.js is not loaded. Please include Matter.js via CDN: https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js");
    };

    if (typeof Matter === 'undefined') {
        // Define no-op functions that log a warning
        const noOp = () => matterNotLoadedWarning();

        $.PhysicsObject = noOp;
        $.physicsEllipse = noOp;
        $.physicsRect = noOp;
        $.physicsPolygon = noOp;
        $.physicsStar = noOp;
        $.physicsBeginShape = noOp;
        $.physicsVertex = noOp;
        $.physicsEndShape = noOp;
        $.worldGravity = noOp;
        $.updatePhysics = noOp;

        if ($._isGlobal) {
            globalScope.PhysicsObject = noOp;
            globalScope.physicsEllipse = noOp;
            globalScope.physicsRect = noOp;
            globalScope.physicsPolygon = noOp;
            globalScope.physicsStar = noOp;
            globalScope.physicsBeginShape = noOp;
            globalScope.physicsVertex = noOp;
            globalScope.physicsEndShape = noOp;
            globalScope.worldGravity = noOp;
            globalScope.updatePhysics = noOp;
        }

        return;
    }

    if (typeof decomp !== 'undefined') {
        Matter.Common.setDecomp(decomp);
    }

    const Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite;

    // Create Matter.js engine and world
    const engine = Engine.create();
    const world = engine.world;

    $.physicsObjects = [];

    class PhysicsObject {
        constructor(body, options = {}) {
            this.body = body;
            this.body.label = options.label || 'PhysicsObject';
            this._fill = options.fill || 'rgba(255, 255, 255, 0.50)';
            this._stroke = options.stroke || 'rgba(0, 0, 0, 1)';
            this._static = options.isStatic || false;
            this.debug = options.debug || false;
            World.add(world, this.body);
            $.physicsObjects.push(this);
            this.borderRadius = 0;
            this.strokeWeight = 1;
            // Store initial dimensions for rectangles
            if (this.body.label === 'rectangle') {
                this.width = options.width;
                this.height = options.height;
            }
        }
        moveTo(targetX, targetY, followStrength = 0.1) {
            const scaledTargetX = $.scaleT5Coord(targetX);
            const scaledTargetY = $.scaleT5Coord(targetY);

            const dx = scaledTargetX - this.body.position.x;
            const dy = scaledTargetY - this.body.position.y;

            const velocityX = dx * followStrength;
            const velocityY = dy * followStrength;

            Body.setVelocity(this.body, { x: velocityX, y: velocityY });
        }

        setPosition(x, y) {
            const scaledX = $.scaleT5Coord(x);
            const scaledY = $.scaleT5Coord(y);
            Body.setPosition(this.body, { x: scaledX, y: scaledY });
        }

        get pos() {
            return this.body.position;
        }

        set pos(newPos) {
            Body.setPosition(this.body, newPos);
        }

        get angle() {
            return this.body.angle;
        }

        set angle(newAngle) {
            Body.setAngle(this.body, newAngle);
        }

        get static() {
            return this._static;
        }

        set static(isStatic) {
            this._static = isStatic;
            Body.setStatic(this.body, isStatic);
        }

        get fill() {
            return this._fill;
        }

        set fill(color) {
            this._fill = color.toString();
        }

        get stroke() {
            return this._stroke;
        }

        set stroke(color) {
            this._stroke = color.toString();
        }

        update() {
            this.pos = this.body.position;
            this.angle = this.body.angle;
        }

        display() {
            $.push();
            $.translate(this.pos.x, this.pos.y);
            $.fill(this.fill);
            $.stroke(this.stroke);
            $.strokeWeight(this.strokeWeight);
            $.borderRadius(this.borderRadius);
            if (this.body.label === 'ellipse') {
                $.rotate(this.angle);
                $.ellipse(0, 0, $.inverseScaleT5Coord(this.body.circleRadius * 2));
                if (this.debug) {
                    $.line(0, 0, 0, -$.inverseScaleT5Coord(this.body.circleRadius));
                }
            } else if (this.body.label === 'rectangle') {
                $.rotate(this.angle);
                $.rectMode($.CENTER);
                $.rect(0, 0, $.inverseScaleT5Coord(this.width), $.inverseScaleT5Coord(this.height));
                if (this.debug) {
                    $.line(0, 0, 0, -$.inverseScaleT5Coord(this.height / 2));
                }
            } else if (this.body.label === 'fromVertices') {
                $.beginShape();
                this.body.vertices.forEach((vertex, index) => {
                    $.vertex($.inverseScaleT5Coord(vertex.x - this.pos.x), $.inverseScaleT5Coord(vertex.y - this.pos.y));
                });
                $.endShape($.CLOSE);

                if (this.debug) {
                    const firstVertex = this.body.vertices[0];
                    $.line(0, 0, $.inverseScaleT5Coord(firstVertex.x - this.pos.x), $.inverseScaleT5Coord(firstVertex.y - this.pos.y));
                }

            }
            $.pop();
        }
    }

    function physicsEllipse(x, y, radius, options = {}) {
        [x, y, radius] = $.scaleT5Coords([x, y, radius]);
        radius /= 2;
        const body = Bodies.circle(x, y, radius, options);
        return new PhysicsObject(body, { ...options, label: 'ellipse' });
    }

    function physicsRect(x, y, width, height, options = {}) {
        [x, y, width, height] = $.scaleT5Coords([x, y, width, height]);
        const body = Bodies.rectangle(x, y, width, height, options);
        return new PhysicsObject(body, { ...options, label: 'rectangle', width, height });
    }

    function physicsPolygon(x, y, radius, verts, options = {}) {
        [x, y, radius] = $.scaleT5Coords([x, y, radius]);
        const angleOffset = -Math.PI / 2;
        const angleIncrement = (2 * Math.PI) / verts;
        const vertices = [];
        for (let i = 0; i < verts; i++) {
            const angle = i * angleIncrement + angleOffset;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            vertices.push({ x: vx, y: vy });
        }
        const body = Bodies.fromVertices(x, y, [vertices], options, true);
        return new PhysicsObject(body, { ...options, label: 'fromVertices' });
    }

    function physicsStar(x, y, radius1, radius2, points, options = {}) {
        [x, y, radius1, radius2] = $.scaleT5Coords([x, y, radius1, radius2]);
        const angleOffset = -Math.PI / 2;
        const angleIncrement = (2 * Math.PI) / points;
        const vertices = [];
        for (let i = 0; i < points * 2; i++) {
            const angle = i * angleIncrement / 2 + angleOffset;
            const radius = (i % 2 === 0) ? radius1 : radius2;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            vertices.push({ x: vx, y: vy });
        }
        const body = Bodies.fromVertices(x, y, [vertices], options, true);
        return new PhysicsObject(body, { ...options, label: 'fromVertices' });
    }

    let vertices = [];

    function physicsBeginShape() {
        vertices = [];
    }

    function physicsVertex(x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        vertices.push({ x, y });
    }

    function physicsEndShape(options = {}) {
        const body = Bodies.fromVertices(vertices[0].x, vertices[0].y, [vertices], options, true);
        return new PhysicsObject(body, { ...options, label: 'fromVertices' });
    }

    $.PhysicsObject = PhysicsObject;
    $.physicsEllipse = physicsEllipse;
    $.physicsRect = physicsRect;
    $.physicsPolygon = physicsPolygon;
    $.physicsStar = physicsStar;
    $.physicsBeginShape = physicsBeginShape;
    $.physicsVertex = physicsVertex;
    $.physicsEndShape = physicsEndShape;

    $.worldGravity = function (g) {
        engine.world.gravity.y = g;
    };

    $.updatePhysics = function () {
        Engine.update(engine);
        for (let obj of $.physicsObjects) {
            obj.update();
            obj.display();
        }
        if ($._globalSketch) {
            window.physicsObjects = $.physicsObjects;
        } else {
            p.physicsObjects = $.physicsObjects;
        }
    };

    if ($._globalSketch) {
        globalScope.PhysicsObject = PhysicsObject;
        globalScope.physicsEllipse = physicsEllipse;
        globalScope.physicsRect = physicsRect;
        globalScope.physicsPolygon = physicsPolygon;
        globalScope.physicsStar = physicsStar;
        globalScope.physicsBeginShape = physicsBeginShape;
        globalScope.physicsVertex = physicsVertex;
        globalScope.physicsEndShape = physicsEndShape;
        globalScope.worldGravity = $.worldGravity;
        globalScope.updatePhysics = $.updatePhysics;
    }
};

// Integrate the physics add-on
T5.addOns.physics(T5.prototype, T5.prototype, window);
