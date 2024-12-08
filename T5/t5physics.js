T5.prototype.registerMethod("init", function () {
    $ = this
    if (typeof planck === "undefined") {
        console.warn(
            "Planck.js is not loaded. Ensure you include the library from: https://cdn.jsdelivr.net/npm/planck-js@latest/dist/planck.js"
        )
        return
    }
    const css = `
    html,
    body {
        margin: 0;
        padding: 0;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgb(12, 12, 12);
    }

    canvas {
        display: block;
        max-width: 100%;
        max-height: 100vh;
        width: auto;
        height: auto;
        object-fit: contain;
        /* image-rendering: pixelated;
        font-smooth: never;
        -webkit-font-smoothing: none; */
    }

    :root {
        --checkardPatternA: rgb(26, 27, 31);
        --checkardPatternB: rgb(22, 23, 26);
    }

    canvas {
        background-color: var(--checkardPatternB);
        background-image: linear-gradient(45deg, var(--checkardPatternA) 25%, transparent 25%, transparent 75%, var(--checkardPatternA) 75%, var(--checkardPatternA)), linear-gradient(45deg, var(--checkardPatternA) 25%, transparent 25%, transparent 75%, var(--checkardPatternA) 75%, var(--checkardPatternA));
        background-size: 50px 50px;
        background-position: 0 0, 25px 25px;
    }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    T5.prototype.world = new PhysicsWorld()
    const _createCanvas = $.createCanvas
    this.createCanvas = function (w, h) {
        world.canvas = _createCanvas.call($, w * world.scale, h * world.scale)
        this.resizeRender(w, h)
        return world.canvas
    }
    const _pixelDensity = $.pixelDensity
    this.pixelDensity = function (value) {
        _pixelDensity.call($, value)
        if ($.width) {
            this.resizeRender(width, height)
        }
    }
    this.resizeRender = function (w, h) {
        let windowAspect = windowWidth / windowHeight
        let canvasAspect = w / h
        if (canvasAspect > windowAspect) {
            world.canvas.style("width", "100vw")
            world.canvas.style("height", "auto")
        } else {
            world.canvas.style("width", "auto")
            world.canvas.style("height", "100vh")
        }
    }
    $.strokeWeight(0.25)
})

T5.prototype.registerMethod("pre", function () {
    $ = this

    world.step()
})

T5.prototype.registerMethod("post", function () {
    world.camera.update()
    world.camera.render(() => {
        if (world._gridEnabled) {
            $._drawBackgroundGrid(world._gridEnabled)
        }
        world.bodies.forEach((body) => body.draw())
        world.drawDebug()
    })
    if (typeof postProcess === "function") postProcess()
})

class PhysicsWorld {
    constructor() {
        this.world = planck.World(planck.Vec2(0, 10))
        // Enable sleeping to reduce CPU usage
        this.world.setAllowSleeping(true)
        this.world._gridEnabled = false
        // Reduce iterations for performance gain
        this.velocityIterations = 6
        this.positionIterations = 2
        // Optional: Disable continuous physics if not needed
        this.world.setContinuousPhysics(true)
        this.bodies = []
        this.groups = {}
        this.camera = new Camera(this)
        this._collisionCallbacks = []
        this.scale = 1
        // Reduce cull distances to limit physics and render load
        this.renderCullDistance = max(windowWidth, windowHeight)
        this.physicsCullDistance = max(windowWidth, windowHeight)

        this.timeStep = 1 / 60
        this.activeCollisions = new Set() // Tracks active collisions
        this._collisionCallbacks = []
        this.debugTargets = [] // List of objects to debug
    }

    get x() {
        let x = -width / 2
        let y = -height / 2
        let worldCoords = toScreenCoordinates({ x, y }, this)
        return worldCoords.x
    }

    get y() {
        let x = -width / 2
        let y = -height / 2
        let worldCoords = toScreenCoordinates({ x, y }, this)
        return worldCoords.y
    }

    get width() {
        let x1 = -width / 2 - this.renderCullDistance
        let y1 = -height / 2
        let x2 = width / 2 + this.renderCullDistance
        let y2 = -height / 2

        let worldCoord1 = toScreenCoordinates({ x: x1, y: y1 }, this)
        let worldCoord2 = toScreenCoordinates({ x: x2, y: y2 }, this)

        return Math.abs(worldCoord2.x - worldCoord1.x)
    }

    get height() {
        let x1 = -width / 2
        let y1 = -height / 2 - this.renderCullDistance
        let x2 = -width / 2
        let y2 = height / 2 + this.renderCullDistance

        let worldCoord1 = toScreenCoordinates({ x: x1, y: y1 }, this)
        let worldCoord2 = toScreenCoordinates({ x: x2, y: y2 }, this)

        return Math.abs(worldCoord2.y - worldCoord1.y)
    }
    debug(...targets) {
        // If the first argument is an array (like world.bodies), spread it
        if (targets.length === 1 && Array.isArray(targets[0])) {
            targets = [...targets[0]]
        }

        // If the first argument is a PhysicsGroup, add its bodies
        if (targets.length === 1 && targets[0] instanceof PhysicsGroup) {
            targets = [...targets[0].bodies]
        }

        for (let target of targets) {
            if (target instanceof Body && !this.debugTargets.includes(target)) {
                this.debugTargets.push(target)
            } else if (target instanceof PhysicsGroup) {
                target.bodies.forEach((body) => {
                    if (!this.debugTargets.includes(body)) {
                        this.debugTargets.push(body)
                    }
                })
            }
        }
    }

    stopDebug(...targets) {
        if (targets.length === 0 || (targets.length === 1 && Array.isArray(targets[0]))) {
            this.debugTargets = []
            return
        }

        for (let target of targets) {
            if (target instanceof Body) {
                const index = this.debugTargets.indexOf(target)
                if (index !== -1) {
                    this.debugTargets.splice(index, 1)
                }
            } else if (target instanceof PhysicsGroup) {
                target.bodies.forEach((body) => {
                    const index = this.debugTargets.indexOf(body)
                    if (index !== -1) {
                        this.debugTargets.splice(index, 1)
                    }
                })
            }
        }
    }

    // Clear all debug targets
    clearDebug() {
        this.debugTargets = []
    }

    // Draw debug information
    drawDebug() {
        for (let target of this.debugTargets) {
            if (target instanceof Body) {
                target.debug()
            } else if (target instanceof PhysicsGroup) {
                target.bodies.forEach((body) => body.debug())
            }
        }
    }

    set gravity(g) {
        this.world.setGravity(planck.Vec2(g.x, g.y))
    }

    get gravity() {
        const g = this.world.getGravity()
        return { x: g.x, y: g.y }
    }

    step() {
        this.cullPhysics()
        this.world.step(this.timeStep, this.velocityIterations, this.positionIterations)
        for (let i = 0, len = this.bodies.length; i < len; i++) {
            this.bodies[i].update()
        }
    }

    addBody(body) {
        this.bodies.push(body)
    }

    onCollision(callback) {
        this._collisionCallbacks.push(callback)
        this.world.on("begin-contact", (contact) => {
            const a = contact.getFixtureA().getBody().body
            const b = contact.getFixtureB().getBody().body
            if (a && b) {
                for (let cb of this._collisionCallbacks) {
                    cb(a, b)
                }

                if (typeof a.onCollision === "function") a.onCollision(b)
                if (typeof b.onCollision === "function") b.onCollision(a)
            }
        })
    }

    isColliding(callback) {
        const checkedPairs = new Set()
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i]
            const fixA = bodyA.body.getFixtureList()
            const aabbAABB = fixA.getAABB(0)
            const aabbA = {
                minX: aabbAABB.lowerBound.x,
                maxX: aabbAABB.upperBound.x,
                minY: aabbAABB.lowerBound.y,
                maxY: aabbAABB.upperBound.y,
            }

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j]
                const fixB = bodyB.body.getFixtureList()
                const aabbBABB = fixB.getAABB(0)
                const aabbB = {
                    minX: aabbBABB.lowerBound.x,
                    maxX: aabbBABB.upperBound.x,
                    minY: aabbBABB.lowerBound.y,
                    maxY: aabbBABB.upperBound.y,
                }

                if (!this._aabbOverlap(aabbA, aabbB)) continue
                const pairKey = `${i}-${j}`
                if (!checkedPairs.has(pairKey) && this._areBodiesColliding(bodyA, bodyB)) {
                    checkedPairs.add(pairKey)
                    callback(bodyA, bodyB)
                }
            }
        }
    }

    _aabbOverlap(a, b) {
        return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
    }

    _areBodiesColliding(bodyA, bodyB) {
        if (!bodyA.body || !bodyB.body) return false

        let contactList = bodyA.body.getContactList()
        while (contactList) {
            const contact = contactList.contact
            if (contact.isTouching()) {
                const fixtureA = contact.getFixtureA()
                const fixtureB = contact.getFixtureB()

                // Check if the bodies match
                if (
                    (fixtureA.getBody() === bodyA.body && fixtureB.getBody() === bodyB.body) ||
                    (fixtureA.getBody() === bodyB.body && fixtureB.getBody() === bodyA.body)
                ) {
                    return true
                }
            }
            contactList = contactList.next
        }

        return false
    }

    destroyBody(targetBody) {
        if (!targetBody || !targetBody.body) return

        // Remove from debugTargets if present
        const debugIndex = this.debugTargets.indexOf(targetBody)
        if (debugIndex !== -1) {
            this.debugTargets.splice(debugIndex, 1)
        }

        // Destroy the body in the physics world
        this.world.destroyBody(targetBody.body)

        // Remove from world.bodies
        const index = this.bodies.indexOf(targetBody)
        if (index >= 0) {
            this.bodies.splice(index, 1)
        }
    }

    // Physics culling: remove bodies beyond physicsCullDistance
    cullPhysics() {
        const cameraCenter = this.camera.getWorldCenter()
        for (let i = this.bodies.length - 1; i >= 0; i--) {
            const b = this.bodies[i]
            const pos = b.position
            const dx = pos.x - cameraCenter.x
            const dy = pos.y - cameraCenter.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist > this.physicsCullDistance) {
                // Remove body if too far
                this.destroyBody(b)
            }
        }
    }
}

function toWorldCoordinates(screenCoords, world) {
    const zoom = world.camera.zoom
    // No inversion of y-axis here, y increases downwards in both screen and world
    return {
        x: (screenCoords.x - width / 2) / (world.scale * zoom) + world.camera.x / world.scale,
        y: (screenCoords.y - height / 2) / (world.scale * zoom) + world.camera.y / world.scale,
    }
}

function toScreenCoordinates(worldCoords, world) {
    const zoom = world.camera.zoom
    return {
        x: (worldCoords.x * world.scale - world.camera.x) * zoom + width / 2,
        y: (worldCoords.y * world.scale - world.camera.y) * zoom + height / 2,
    }
}

class Body {
    constructor(x, y, w, h, options = {}) {
        if (typeof h === "object") {
            options = h
            h = w
        }

        let physicsWorld = world
        this.width = w || 1
        this.height = h || 1
        this.id = options.id || null
        this.fill = options.fill || "#14151f"
        this.type = options.type || "dynamic" // 'static', 'dynamic', 'kinematic'
        this.shapeType = options.shape || "rect" // 'rect', 'ellipse', 'polygon'
        this.sides = options.sides || 5
        this.radius = options.radius || Math.min(w, h) / 2
        this.stroke = options.stroke || "#bababa"
        this.strokeWeight = options.strokeWeight || 0.25
        this.borderRadius = options.borderRadius || 0
        this.friction = options.friction || 0.3
        this.restitution = options.restitution || 0.5
        this.density = options.density || 1.0
        this.group = options.group || null
        this.joints = []

        const worldCoords = toWorldCoordinates({ x, y }, world)

        const bodyDef = {
            type: this.type,
            position: planck.Vec2(worldCoords.x, worldCoords.y),
            allowSleep: true,
            ...options,
        }

        this.body = physicsWorld.world.createBody(bodyDef)
        this.body.body = this

        this.addFixture()

        for (const [key, value] of Object.entries(options)) {
            if (!(key in this)) {
                this[key] = value
            }
        }

        this.world = physicsWorld
        this.world.addBody(this)

        if (this.group) {
            this.group.bodies.push(this)
        }
    }

    addFixture() {
        let shape
        switch (this.shapeType) {
            case "rect":
                shape = planck.Box(this.width / 2, this.height / 2)
                break
            case "ellipse":
                shape = planck.Circle(this.radius)
                break
            case "polygon":
                shape = planck.Polygon(this.generatePolygonVertices(this.radius, this.sides))
                break
            default:
                console.warn("Unsupported shape type; defaulting to rectangle.")
                shape = planck.Box(this.width / 2, this.height / 2)
        }

        this.body.createFixture({
            shape,
            density: this.density,
            friction: this.friction,
            restitution: this.restitution,
        })
    }

    generatePolygonVertices(radius, sides) {
        const angleOffset = -Math.PI / 2
        const angleIncrement = (2 * Math.PI) / sides
        const vertices = []
        for (let i = 0; i < sides; i++) {
            const angle = i * angleIncrement + angleOffset
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            vertices.push(planck.Vec2(x, y))
        }
        return vertices
    }

    addJoint(joint) {
        this.joints.push(joint)
    }

    removeJoint(joint) {
        const index = this.joints.indexOf(joint)
        if (index !== -1) {
            this.joints.splice(index, 1)
        }
    }
    get position() {
        const position = this.body.getPosition()
        let x = position.x
        let y = position.y
        let worldCoords = toScreenCoordinates({ x, y }, this.world)
        return { x: worldCoords.x, y: worldCoords.y }
    }
    get worldPosition() {
        const worldPos = this.body.getPosition()
        return { x: worldPos.x, y: worldPos.y }
    }

    set position(screenPos) {
        const worldPos = toWorldCoordinates(screenPos, this.world)
        this.body.setTransform(planck.Vec2(worldPos.x, worldPos.y), this.body.getAngle())
    }

    moveTo(x, y) {
        this.position = toScreenCoordinates({ x, y })
    }

    get vel() {
        const velocity = this.body.getLinearVelocity()
        return { x: velocity.x, y: velocity.y } // Velocity stays in world space
    }

    set vel(velocity) {
        this.body.setLinearVelocity(planck.Vec2(velocity.x, velocity.y))
    }

    setVelocity(velocity) {
        if (this.type === "dynamic" && this.body) {
            this.body.setLinearVelocity(planck.Vec2(velocity.x, velocity.y))
        }
    }

    getVelocity() {
        if (this.body) {
            const v = this.body.getLinearVelocity()
            return { x: v.x, y: v.y }
        }
        return { x: 0, y: 0 }
    }

    get rotation() {
        return this.body.getAngle()
    }

    set rotation(angle) {
        const pos = this.body.getPosition()
        this.body.setTransform(pos, angle)
    }

    get mass() {
        return this.body.getMass()
    }

    set mass(value) {
        const area = this.width * this.height || Math.PI * this.radius ** 2
        this.density = value / area
        this.body.getFixtureList().setDensity(this.density)
        this.body.resetMassData()
    }

    applyForce(force) {
        if (this.type === "dynamic" && this.body) {
            this.body.applyForceToCenter(planck.Vec2(force.x, force.y))
        }
    }

    applyImpulse(impulse) {
        if (this.type === "dynamic" && this.body) {
            this.body.applyLinearImpulse(planck.Vec2(impulse.x, impulse.y), this.body.getWorldCenter())
        }
    }

    _checkContactWith(otherBody) {
        let contactList = this.body.getContactList()
        while (contactList) {
            const contact = contactList.contact
            if (
                contact.isTouching() &&
                (contact.getFixtureA().getBody() === otherBody.body ||
                    contact.getFixtureB().getBody() === otherBody.body)
            ) {
                return true
            }
            contactList = contactList.next
        }
        return false
    }

    isColliding(otherBody) {
        return this._checkContactWith(otherBody)
    }

    collides(otherBody) {
        return this.isColliding(otherBody)
    }

    isGrounded(...groundRefs) {
        const groundBodies = this._flattenGroundRefs(groundRefs)
        let contactList = this.body.getContactList()
        while (contactList) {
            const contact = contactList.contact
            if (contact.isTouching()) {
                const bodyA = contact.getFixtureA().getBody().body
                const bodyB = contact.getFixtureB().getBody().body
                const otherBody = bodyA === this ? bodyB : bodyA

                if (groundBodies.includes(otherBody)) {
                    return true
                }
            }
            contactList = contactList.next
        }
        return false
    }

    _flattenGroundRefs(groundRefs) {
        const result = []
        for (let ref of groundRefs) {
            if (ref instanceof PhysicsGroup) {
                result.push(...ref.bodies)
            } else if (Array.isArray(ref)) {
                for (let item of ref) {
                    if (item instanceof PhysicsGroup) {
                        result.push(...item.bodies)
                    } else {
                        result.push(item)
                    }
                }
            } else {
                result.push(ref)
            }
        }
        return result
    }

    destroy() {
        if (this.world && this.body) {
            this.joints.forEach((joint) => this.world.world.destroyJoint(joint))
            this.world.world.destroyBody(this.body)
            const idx = this.world.bodies.indexOf(this)
            if (idx >= 0) this.world.bodies.splice(idx, 1)
        }
    }

    update() {
        // Per-frame logic if needed
    }

    draw() {
        // Render culling check
        const camCenter = this.world.camera.getWorldCenter()
        const pos = this.position
        const dx = pos.x - camCenter.x
        const dy = pos.y - camCenter.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > this.world.renderCullDistance) {
            // Skip drawing if outside render cull distance
            return
        }

        if (!this.body) return
        const position = this.body.getPosition()
        const angle = this.body.getAngle()

        push()
        translate(position.x * this.world.scale, position.y * this.world.scale)
        rotate(angle)
        if (this.stroke) {
            stroke(this.stroke)
            strokeWeight(this.strokeWeight)
        } else {
            noStroke()
        }
        fill(this.fill)
        rectMode(CENTER)
        borderRadius(this.borderRadius * this.world.scale)
        switch (this.shapeType) {
            case "rect":
                rect(0, 0, this.width * this.world.scale, this.height * this.world.scale)
                break
            case "ellipse":
                ellipse(0, 0, this.radius * 2 * this.world.scale, this.radius * 2 * this.world.scale)
                break
            case "polygon":
                polygon(0, 0, this.radius * this.world.scale, this.sides)
                break
        }
        pop()
    }

    debug() {
        const fixture = this.body.getFixtureList()
        if (!fixture) {
            console.warn(`Debug Error: Body with ID "${this.id}" has no fixtures.`)
            return // Exit early to prevent errors
        }

        const aabb = fixture.getAABB(0)
        if (!aabb) {
            console.warn(`Debug Error: Fixture for body with ID "${this.id}" has no AABB.`)
            return // Exit early to prevent errors
        }

        const pos1 = aabb.lowerBound
        const pos2 = aabb.upperBound

        rectMode(CORNER)
        noFill()
        stroke("#ff0022")
        strokeWeight(this.strokeWeight)

        rect(
            pos1.x * this.world.scale,
            pos1.y * this.world.scale,
            (pos2.x - pos1.x) * this.world.scale,
            (pos2.y - pos1.y) * this.world.scale
        )
    }
}
class Joint {
    constructor(type, bodyA, bodyB, options = {}) {
        if (!planck[type]) {
            throw new Error(`Unsupported joint type: ${type}`)
        }

        this.type = type
        this.bodyA = bodyA
        this.bodyB = bodyB

        // Clone options to avoid mutation
        let jointOptions = { ...options }

        // Convert anchor points to planck.Vec2 if they exist
        if (jointOptions.anchor) {
            jointOptions.anchor = planck.Vec2(jointOptions.anchor.x, jointOptions.anchor.y)
        }
        if (jointOptions.anchorA) {
            jointOptions.anchorA = planck.Vec2(jointOptions.anchorA.x, jointOptions.anchorA.y)
        }
        if (jointOptions.anchorB) {
            jointOptions.anchorB = planck.Vec2(jointOptions.anchorB.x, jointOptions.anchorB.y)
        }
        if (jointOptions.axis) {
            jointOptions.axis = planck.Vec2(jointOptions.axis.x, jointOptions.axis.y)
        }

        // Create the joint definition based on joint type
        let jointDef
        switch (type) {
            case "RevoluteJoint":
                jointDef = {
                    bodyA: bodyA.body,
                    bodyB: bodyB.body,
                    anchor: jointOptions.anchor || bodyA.worldPosition,
                    ...jointOptions,
                }
                break
            case "DistanceJoint":
                jointDef = {
                    bodyA: bodyA.body,
                    bodyB: bodyB.body,
                    anchorA: jointOptions.anchorA || bodyA.worldPosition,
                    anchorB: jointOptions.anchorB || bodyB.worldPosition,
                    length: jointOptions.length || bodyA.body.getPosition().distance(bodyB.body.getPosition()),
                    frequencyHz: jointOptions.frequencyHz || 0,
                    dampingRatio: jointOptions.dampingRatio || 0,
                    ...jointOptions,
                }
                break
            case "PrismaticJoint":
                jointDef = {
                    bodyA: bodyA.body,
                    bodyB: bodyB.body,
                    anchor: jointOptions.anchor || bodyA.worldPosition,
                    axis: jointOptions.axis || planck.Vec2(1, 0),
                    ...jointOptions,
                }
                break
            // Add cases for other joint types as needed
            default:
                jointDef = {
                    bodyA: bodyA.body,
                    bodyB: bodyB.body,
                    ...jointOptions,
                }
        }

        // Instantiate the joint in the world
        this.joint = world.world.createJoint(new planck[type](jointDef))

        // Add the joint to the bodies for tracking
        bodyA.addJoint(this)
        bodyB.addJoint(this)
    }

    destroy() {
        if (this.joint) {
            world.world.destroyJoint(this.joint)
            this.joint = null

            // Remove from associated bodies
            this.bodyA.removeJoint(this)
            this.bodyB.removeJoint(this)
        }
    }

    getReactionForce(inv_dt) {
        return this.joint.getReactionForce(inv_dt)
    }

    getReactionTorque(inv_dt) {
        return this.joint.getReactionTorque(inv_dt)
    }

    setMotorSpeed(speed) {
        if (this.joint.setMotorSpeed) {
            this.joint.setMotorSpeed(speed)
        } else {
            console.warn(`${this.type} does not support motor speed`)
        }
    }

    setMaxMotorTorque(torque) {
        if (this.joint.setMaxMotorTorque) {
            this.joint.setMaxMotorTorque(torque)
        } else {
            console.warn(`${this.type} does not support max motor torque`)
        }
    }

    enableMotor(flag) {
        if (this.joint.enableMotor) {
            this.joint.enableMotor(flag)
        } else {
            console.warn(`${this.type} does not support motor`)
        }
    }

    debug() {
        let screenA, screenB
        switch (this.type) {
            case "RevoluteJoint":
                const anchor = this.joint.getAnchorA()
                screenA = toScreenCoordinates({ x: anchor.x, y: anchor.y }, world)
                screenB = screenA // RevoluteJoint has a single anchor point
                break
            case "DistanceJoint":
                const anchorA = this.joint.getAnchorA()
                const anchorB = this.joint.getAnchorB()
                screenA = toScreenCoordinates({ x: anchorA.x, y: anchorA.y }, world)
                screenB = toScreenCoordinates({ x: anchorB.x, y: anchorB.y }, world)
                break
            // Add cases for other joint types as needed
            default:
                const anchorC = this.joint.getAnchorA()
                const anchorD = this.joint.getAnchorB()
                screenA = toScreenCoordinates({ x: anchorC.x, y: anchorC.y }, world)
                screenB = toScreenCoordinates({ x: anchorD.x, y: anchorD.y }, world)
                break
        }

        push()
        stroke(255, 0, 0)
        strokeWeight(0.5)
        line(screenA.x, screenA.y, screenB.x, screenB.y)
        pop()
    }
}

class Camera {
    constructor(physicsWorld) {
        this.world = physicsWorld
        this.x = 0
        this.y = 0
        this.zoom = 1
        this.target = null
        this.lag = 1
        this.offsetX = 0
        this.offsetY = 0
    }

    follow(body, offsetX = 0, offsetY = 0) {
        this.target = body
        this.offsetX = offsetX
        this.offsetY = offsetY
    }

    update() {
        if (this.target && this.target.body) {
            const pos = this.target.body.getPosition()
            const targetX = pos.x * this.world.scale + this.offsetX
            const targetY = pos.y * this.world.scale + this.offsetY
            this.x = lerp(this.x, targetX, this.lag)
            this.y = lerp(this.y, targetY, this.lag)
        }
    }

    getWorldCenter() {
        return { x: this.x / this.world.scale, y: this.y / this.world.scale }
    }

    render(drawCallback) {
        push()
        translate(width / 2, height / 2)
        scale(this.zoom)
        translate(-this.x, -this.y) // Just shift by camera x and y, no inversion
        drawCallback()
        pop()
    }
}

// Update PhysicsGroup to auto-register on id set
class PhysicsGroup {
    constructor() {
        this._id = null
        this.fill = "#14151f"
        this.type = "static"
        this.density = 1.0
        this.width = 1
        this.height = 1
        this.stroke = "#bababa"
        this.strokeWeight = 0.25
        this.borderRadius = 0
        this.bodies = []
    }

    // When id is set, automatically register in world.groups
    set id(value) {
        this._id = value
        // If id is set and world is defined, register this group
        if (value && typeof world !== "undefined" && world) {
            world.groups[value] = this
        }
    }

    get id() {
        return this._id
    }

    instantiate(physicsWorld, x, y) {
        return new Body(x, y, this.width, this.height, {
            id: this.id,
            fill: this.fill,
            type: this.type,
            density: this.density,
            group: this,
            stroke: this.stroke,
            strokeWeight: this.strokeWeight,
            borderRadius: this.borderRadius,
        })
    }

    add(x, y, w, h, attributes = {}) {
        const mergedAttributes = {
            id: this.id,
            fill: this.fill,
            type: this.type,
            density: this.density,
            group: this,
            stroke: this.stroke,
            strokeWeight: this.strokeWeight,
            borderRadius: this.borderRadius,
            width: w || this.width,
            height: h || this.height,
            ...attributes,
        }

        const body = new Body(x, y, mergedAttributes.width, mergedAttributes.height, mergedAttributes)
        for (const [key, value] of Object.entries(attributes)) {
            if (!(key in body)) {
                body[key] = value
            }
        }
        this.bodies.push(body)
        return body
    }
}

// Update TileMap to use world.groups
class TileMap {
    constructor(tileSize, mapData) {
        this.physicsWorld = world
        this.tileSize = tileSize
        this.mapData = mapData

        world.tilesX = mapData[0]?.length || 0
        world.tilesY = mapData.length

        for (let row = 0; row < mapData.length; row++) {
            const line = mapData[row]
            for (let col = 0; col < line.length; col++) {
                const ch = line[col]
                if (ch === "." || ch === " ") continue

                // Now we look up the group in world.groups
                const group = world.groups[ch]
                if (group instanceof PhysicsGroup) {
                    group.instantiate(
                        this.physicsWorld,
                        col * this.tileSize + this.tileSize / 2,
                        row * this.tileSize + this.tileSize / 2
                    )
                } else {
                    console.warn(`No PhysicsGroup found with ID: ${ch}`)
                }
            }
        }
    }
}

T5.prototype.backgroundGrid = function (spacing) {
    world._gridEnabled = spacing
}
T5.prototype._drawBackgroundGrid = function (spacing) {
    const startX = -width / 2
    const startY = -height / 2

    let gridWidth = int(world.tilesX * spacing || width) - 1
    let gridHeight = int(world.tilesY * spacing || height) - 1

    const endX = startX + gridWidth
    const endY = startY + gridHeight

    for (let x = startX; x <= endX; x += spacing) {
        for (let y = startY; y <= endY; y += spacing) {
            noFill()
            rectMode(CORNER)
            stroke(119, 119, 119, 47)
            strokeWeight(0.25)
            rect(x, y, spacing, spacing)
        }
    }
}
