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
        Composite = Matter.Composite,
        Events = Matter.Events,
        Collision = Matter.Collision,
        Constraint = Matter.Constraint;

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
            this.rotationEnabled = options.rotationEnabled !== undefined ? options.rotationEnabled : true;
            World.add(world, this.body);
            $.physicsObjects.push(this);
            this.borderRadius = 0;
            this.strokeWeight = 1;
            this._maxSpeedX = Infinity;
            this._maxSpeedY = Infinity;
            if (this.body.label === 'rectangle') {
                this.width = options.width;
                this.height = options.height;
            }
            this.x = $.inverseScaleT5Coord(this.pos.x);
            this.y = $.inverseScaleT5Coord(this.pos.y);
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

        applyForce(force) {
            Body.applyForce(this.body, this.body.position, force);
            this._applySpeedLimits();
        }

        _applySpeedLimits() {
            const velocity = this.body.velocity;
            const newVelocity = {
                x: Math.sign(velocity.x) * Math.min(Math.abs(velocity.x), this._maxSpeedX),
                y: Math.sign(velocity.y) * Math.min(Math.abs(velocity.y), this._maxSpeedY)
            };
            Body.setVelocity(this.body, newVelocity);
        }

        collidesWith(otherBody) {
            return Collision.collides(this.body, otherBody.body);
        }

        remove() {
            World.remove(world, this.body);
            const index = $.physicsObjects.indexOf(this);
            if (index !== -1) {
                $.physicsObjects.splice(index, 1);
            }
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
            if (this.rotationEnabled) {
                Body.setAngle(this.body, newAngle);
            }
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

        get velocity() {
            return this.body.velocity;
        }

        set velocity(newVelocity) {
            Body.setVelocity(this.body, {
                x: Math.sign(newVelocity.x) * Math.min(Math.abs(newVelocity.x), this._maxSpeedX),
                y: Math.sign(newVelocity.y) * Math.min(Math.abs(newVelocity.y), this._maxSpeedY)
            });
        }

        get density() {
            return this.body.density;
        }

        set density(newDensity) {
            Body.setDensity(this.body, newDensity);
        }

        get mass() {
            return this.body.mass;
        }

        set mass(newMass) {
            Body.setMass(this.body, newMass);
        }

        get friction() {
            return this.body.friction;
        }

        set friction(newFriction) {
            this.body.friction = newFriction;
        }

        get frictionAir() {
            return this.body.frictionAir;
        }

        set frictionAir(newFrictionAir) {
            this.body.frictionAir = newFrictionAir;
        }

        get restitution() {
            return this.body.restitution;
        }

        set restitution(newRestitution) {
            this.body.restitution = newRestitution;
        }

        get gravityScale() {
            return this.body.gravityScale;
        }

        set gravityScale(newGravityScale) {
            this.body.gravityScale = newGravityScale;
        }

        get speed() {
            const that = this;
            return {
                get x() {
                    return that.body.velocity.x;
                },
                set x(value) {
                    that.body.velocity.x = Math.sign(value) * Math.min(Math.abs(value), that._maxSpeedX);
                },
                get y() {
                    return that.body.velocity.y;
                },
                set y(value) {
                    that.body.velocity.y = Math.sign(value) * Math.min(Math.abs(value), that._maxSpeedY);
                }
            };
        }

        get maxSpeed() {
            const that = this;
            return {
                get x() {
                    return that._maxSpeedX;
                },
                set x(value) {
                    that._maxSpeedX = value;
                },
                get y() {
                    return that._maxSpeedY;
                },
                set y(value) {
                    that._maxSpeedY = value;
                }
            };
        }

        update() {
            this.pos = this.body.position;
            this.x = $.inverseScaleT5Coord(this.pos.x);
            this.y = $.inverseScaleT5Coord(this.pos.y);
            if (this.rotationEnabled) {
                this.angle = this.body.angle;
            }
            this._applySpeedLimits();
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

    class PhysicsGroup {
        constructor() {
            this.objects = [];
            return new Proxy(this, {
                get: (target, prop) => {
                    if (typeof prop === 'string' && !isNaN(prop)) {
                        return target.objects[prop];
                    } else if (prop in target) {
                        return target[prop];
                    } else {
                        return undefined;
                    }
                }
            });
        }

        add(object) {
            this.objects.push(object);
        }

        remove(object) {
            object.remove();
            const index = this.objects.indexOf(object);
            if (index !== -1) {
                this.objects.splice(index, 1);
            }
        }

        checkCollisions(target) {
            for (let object of this.objects) {
                if (object.collidesWith(target)) {
                    return object;
                }
            }
            return null;
        }

        update() {
            for (let object of this.objects) {
                object.update();
                object.display();
            }
        }

        get length() {
            return this.objects.length;
        }
    }
    class Camera {
        constructor(target, offsetX = 0, offsetY = 0) {
            this.target = target;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }

        apply() {
            $.translate(-this.target.pos.x + this.offsetX, -this.target.pos.y + this.offsetY);
        }
    }

    function scaleOptions(options = {}) {
        const scaledOptions = { ...options };
        if (scaledOptions.stiffness !== undefined) {
            scaledOptions.stiffness = $.scaleT5Coord(scaledOptions.stiffness);
        }
        if (scaledOptions.damping !== undefined) {
            scaledOptions.damping = $.scaleT5Coord(scaledOptions.damping);
        }
        if (scaledOptions.restitution !== undefined) {
            scaledOptions.restitution = $.scaleT5Coord(scaledOptions.restitution);
        }
        if (scaledOptions.length !== undefined) {
            scaledOptions.length = $.scaleT5Coord(scaledOptions.length);
        }
        if (scaledOptions.mass !== undefined) {
            scaledOptions.mass = $.scaleT5Coord(scaledOptions.mass);
        }
        if (scaledOptions.vertices !== undefined && Array.isArray(scaledOptions.vertices)) {
            scaledOptions.vertices = scaledOptions.vertices.map(vertex => {
                return { x: $.scaleT5Coord(vertex.x), y: $.scaleT5Coord(vertex.y) };
            });
        }
        return scaledOptions;
    }

    function physicsEllipse(x, y, radius, options = {}) {
        [x, y, radius] = $.scaleT5Coords([x, y, radius]);
        radius /= 2;
        const scaledOptions = scaleOptions(options);
        const body = Bodies.circle(x, y, radius, scaledOptions);
        return new PhysicsObject(body, { ...scaledOptions, label: 'ellipse' });
    }

    function physicsRect(x, y, width, height, options = {}) {
        [x, y, width, height] = $.scaleT5Coords([x, y, width, height]);
        const scaledOptions = scaleOptions(options);
        const body = Bodies.rectangle(x, y, width, height, scaledOptions);
        return new PhysicsObject(body, { ...scaledOptions, label: 'rectangle', width, height });
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
        const scaledOptions = scaleOptions(options);
        const body = Bodies.fromVertices(x, y, [vertices], scaledOptions, true);
        return new PhysicsObject(body, { ...scaledOptions, label: 'fromVertices' });
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
        const scaledOptions = scaleOptions(options);
        const body = Bodies.fromVertices(x, y, [vertices], scaledOptions, true);
        return new PhysicsObject(body, { ...scaledOptions, label: 'fromVertices' });
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
        const scaledOptions = scaleOptions(options);
        const body = Bodies.fromVertices(vertices[0].x, vertices[0].y, [vertices], scaledOptions, true);
        return new PhysicsObject(body, { ...scaledOptions, label: 'fromVertices' });
    }

    $.physicsConstraints = [];

    class PhysicsConstraint {
        constructor(constraint, options = {}) {
            this.constraint = constraint;
            this._stroke = options.stroke || 'rgba(0, 0, 0, 1)';
            this._fill = options.fill || 'rgba(255, 255, 255, 0.50)';
            this._borderRadius = options.borderRadius || 0;
            this._strokeWeight = options.strokeWeight || 1;
            this._width = options.width || 1;
            $.physicsConstraints.push(this);
        }

        display() {
            const pointA = this.constraint.bodyA.position;
            const pointB = this.constraint.pointB;
            const distance = dist(pointA.x, pointA.y, pointB.x, pointB.y);
            const angle = atan2(pointB.y - pointA.y, pointB.x - pointA.x);
            let w = (this.width)
            $.push();
            $.translate(pointA.x, pointA.y);
            $.rotate(angle);
            $.borderRadius(this._borderRadius);
            $.rectMode($.CORNER);
            $.stroke(this._stroke);
            $.strokeWeight(this._strokeWeight);
            $.fill(this._fill);
            $.rect(0, -w / 2, $.inverseScaleT5Coord(distance), w);
            $.pop();
        }

        get pointA() {
            const that = this;
            return {
                get x() {
                    return $.inverseScaleT5Coord(that.constraint.bodyA.position.x);
                },
                set x(value) {
                    Body.setPosition(that.constraint.bodyA, { x: $.scaleT5Coord(value), y: that.constraint.bodyA.position.y });
                },
                get y() {
                    return $.inverseScaleT5Coord(that.constraint.bodyA.position.y);
                },
                set y(value) {
                    Body.setPosition(that.constraint.bodyA, { x: that.constraint.bodyA.position.x, y: $.scaleT5Coord(value) });
                }
            };
        }

        get pointB() {
            const that = this;
            return {
                get x() {
                    return $.inverseScaleT5Coord(that.constraint.pointB.x);
                },
                set x(value) {
                    that.constraint.pointB.x = $.scaleT5Coord(value);
                },
                get y() {
                    return $.inverseScaleT5Coord(that.constraint.pointB.y);
                },
                set y(value) {
                    that.constraint.pointB.y = $.scaleT5Coord(value);
                }
            };
        }

        set stroke(value) {
            this._stroke = value.toString();
        }

        get stroke() {
            return this._stroke;
        }

        set fill(value) {
            this._fill = value.toString();
        }

        get fill() {
            return this._fill;
        }

        set borderRadius(value) {
            this._borderRadius = value;
        }

        get borderRadius() {
            return this._borderRadius;
        }

        set strokeWeight(value) {
            this._strokeWeight = $.scaleT5Coord(value);
        }

        get strokeWeight() {
            return $.inverseScaleT5Coord(this._strokeWeight);
        }

        set width(value) {
            this._width = $.scaleT5Coord(value);
        }

        get width() {
            return $.inverseScaleT5Coord(this._width);
        }

        set length(value) {
            this.constraint.length = $.scaleT5Coord(value);
        }

        get length() {
            return $.inverseScaleT5Coord(this.constraint.length);
        }

        set stiffness(value) {
            this.constraint.stiffness = value;
        }

        get stiffness() {
            return this.constraint.stiffness;
        }

        set damping(value) {
            this.constraint.damping = value;
        }

        get damping() {
            return this.constraint.damping;
        }
    }


    function createConstraint(bodyA, pointB, options = {}) {
        [pointB.x, pointB.y] = $.scaleT5Coords([pointB.x, pointB.y]);

        const scaledOptions = scaleOptions(options);
        const constraint = Constraint.create({
            bodyA: bodyA,
            pointB: pointB,
            ...scaledOptions
        });

        World.add(world, constraint);
        const physicsConstraint = new PhysicsConstraint(constraint, options);

        return new Proxy(physicsConstraint, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                } else if (prop in target.constraint) {
                    return target.constraint[prop];
                } else {
                    return undefined;
                }
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                } else if (prop in target.constraint) {
                    target.constraint[prop] = value;
                } else {
                    return false;
                }
                return true;
            }
        });
    }

    $.PhysicsObject = PhysicsObject;
    $.PhysicsGroup = PhysicsGroup;
    $.Camera = Camera;
    $.physicsEllipse = physicsEllipse;
    $.physicsRect = physicsRect;
    $.physicsPolygon = physicsPolygon;
    $.physicsStar = physicsStar;
    $.physicsBeginShape = physicsBeginShape;
    $.physicsVertex = physicsVertex;
    $.physicsEndShape = physicsEndShape;
    $.createConstraint = createConstraint;

    $.worldGravity = function (g) {
        engine.world.gravity.y = $.scaleT5Coord(g);
    };

    $.updatePhysics = function () {
        Engine.update(engine);
        for (let obj of $.physicsObjects) {
            obj.update();
            obj.display();
        }
        for (let constraint of $.physicsConstraints) {
            constraint.display();
        }
        if ($._globalSketch) {
            window.physicsObjects = $.physicsObjects;
        } else {
            p.physicsObjects = $.physicsObjects;
        }
    };

    if ($._globalSketch) {
        globalScope.PhysicsObject = PhysicsObject;
        globalScope.PhysicsGroup = PhysicsGroup;
        globalScope.Camera = Camera;
        globalScope.physicsEllipse = physicsEllipse;
        globalScope.physicsRect = physicsRect;
        globalScope.physicsPolygon = physicsPolygon;
        globalScope.physicsStar = physicsStar;
        globalScope.physicsBeginShape = physicsBeginShape;
        globalScope.physicsVertex = physicsVertex;
        globalScope.physicsEndShape = physicsEndShape;
        globalScope.createConstraint = createConstraint;
        globalScope.worldGravity = $.worldGravity;
        globalScope.updatePhysics = $.updatePhysics;
    }
};

// Integrate the physics add-on
T5.addOns.physics(T5.prototype, T5.prototype, window);
