//**************************************************************************//
//********************************-T5Vector-********************************//
//**************************************************************************//

class T5Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toString() {
        return `T5Vector(${this.x}, ${this.y}, ${this.z})`;
    }

    set(x, y, z) {
        if (x instanceof T5Vector) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else if (Array.isArray(x)) {
            this.x = x[0] || 0;
            this.y = x[1] || 0;
            this.z = x[2] || 0;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        return this;
    }

    copy() {
        return new T5Vector(this.x, this.y, this.z);
    }

    add(v) {
        if (v instanceof T5Vector) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        } else if (Array.isArray(v)) {
            this.x += v[0] || 0;
            this.y += v[1] || 0;
            this.z += v[2] || 0;
        } else {
            this.x += v || 0;
            this.y += v || 0;
            this.z += v || 0;
        }
        return this;
    }

    rem(v) {
        if (v instanceof T5Vector) {
            this.x %= v.x;
            this.y %= v.y;
            this.z %= v.z;
        } else if (Array.isArray(v)) {
            this.x %= v[0] || 1;
            this.y %= v[1] || 1;
            this.z %= v[2] || 1;
        } else {
            this.x %= v || 1;
            this.y %= v || 1;
            this.z %= v || 1;
        }
        return this;
    }

    sub(v) {
        if (v instanceof T5Vector) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        } else if (Array.isArray(v)) {
            this.x -= v[0] || 0;
            this.y -= v[1] || 0;
            this.z -= v[2] || 0;
        } else {
            this.x -= v || 0;
            this.y -= v || 0;
            this.z -= v || 0;
        }
        return this;
    }

    mult(v) {
        if (v instanceof T5Vector) {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
        } else if (Array.isArray(v)) {
            this.x *= v[0] || 1;
            this.y *= v[1] || 1;
            this.z *= v[2] || 1;
        } else {
            this.x *= v || 1;
            this.y *= v || 1;
            this.z *= v || 1;
        }
        return this;
    }

    div(v) {
        if (v instanceof T5Vector) {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
        } else if (Array.isArray(v)) {
            this.x /= v[0] || 1;
            this.y /= v[1] || 1;
            this.z /= v[2] || 1;
        } else {
            this.x /= v || 1;
            this.y /= v || 1;
            this.z /= v || 1;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        const crossX = this.y * v.z - this.z * v.y;
        const crossY = this.z * v.x - this.x * v.z;
        const crossZ = this.x * v.y - this.y * v.x;
        return new T5Vector(crossX, crossY, crossZ);
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    normalize() {
        const len = this.mag();
        if (len !== 0) {
            this.div(len);
        }
        return this;
    }

    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    setMag(len) {
        this.normalize();
        this.mult(len);
        return this;
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }

    setHeading(angle) {
        const mag = this.mag();
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;
        return this;
    }

    rotate(angle) {
        const newHeading = this.heading() + angle;
        const mag = this.mag();
        this.x = Math.cos(newHeading) * mag;
        this.y = Math.sin(newHeading) * mag;
        return this;
    }

    angleBetween(v) {
        const dotmagmag = this.dot(v) / (this.mag() * v.mag());
        return Math.acos(Math.max(-1, Math.min(1, dotmagmag)));
    }

    lerp(v, amt) {
        this.x = lerp(this.x, v.x, amt);
        this.y = lerp(this.y, v.y, amt);
        this.z = lerp(this.z, v.z, amt);
        return this;
    }

    slerp(v, amt) {
        const omega = this.angleBetween(v);
        const sinOmega = Math.sin(omega);
        const scale0 = Math.sin((1 - amt) * omega) / sinOmega;
        const scale1 = Math.sin(amt * omega) / sinOmega;

        this.x = scale0 * this.x + scale1 * v.x;
        this.y = scale0 * this.y + scale1 * v.y;
        this.z = scale0 * this.z + scale1 * v.z;
        return this;
    }

    reflect(n) {
        const dot2 = this.dot(n) * 2;
        this.x = this.x - n.x * dot2;
        this.y = this.y - n.y * dot2;
        this.z = this.z - n.z * dot2;
        return this;
    }

    array() {
        return [this.x, this.y, this.z];
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    static add(v1, v2) {
        return v1.copy().add(v2);
    }

    static sub(v1, v2) {
        return v1.copy().sub(v2);
    }

    static mult(v, n) {
        return v.copy().mult(n);
    }

    static div(v, n) {
        return v.copy().div(n);
    }

    static dist(v1, v2) {
        return v1.dist(v2);
    }

    static dot(v1, v2) {
        return v1.dot(v2);
    }

    static cross(v1, v2) {
        return v1.cross(v2);
    }

    static fromAngle(angle) {
        return new T5Vector(Math.cos(angle), Math.sin(angle));
    }

    static fromAngles(theta, phi) {
        return new T5Vector(
            Math.cos(theta) * Math.cos(phi),
            Math.sin(theta),
            Math.cos(theta) * Math.sin(phi)
        );
    }
}

// Aliases for global scope
const createVector = (x, y, z) => new T5Vector(x, y, z);