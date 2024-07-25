//************************************************************************//
//*******************************-T5Vector-*******************************//
//************************************************************************//
T5.addOns.vector = ($, p, globalScope) => {
    class Vector {
        constructor(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }

        set(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }

        copy() {
            return new Vector(this.x, this.y, this.z);
        }

        _arg2v(...args) {
            if (args.length === 1 && typeof args[0] === 'object') {
                return args[0];
            } else if (args.length >= 2) {
                return { x: args[0], y: args[1], z: args[2] || 0 };
            } else {
                return { x: args[0], y: args[0], z: args[0] };
            }
        }

        _calcNorm() {
            this._cnsq = this.x * this.x + this.y * this.y + this.z * this.z;
            this._cn = Math.sqrt(this._cnsq);
        }

        add(...args) {
            let u = this._arg2v(...args);
            this.x += u.x;
            this.y += u.y;
            this.z += u.z;
            return this;
        }

        rem(...args) {
            let u = this._arg2v(...args);
            this.x %= u.x;
            this.y %= u.y;
            this.z %= u.z;
            return this;
        }

        sub(...args) {
            let u = this._arg2v(...args);
            this.x -= u.x;
            this.y -= u.y;
            this.z -= u.z;
            return this;
        }

        mult(...args) {
            let u = this._arg2v(...args);
            this.x *= u.x;
            this.y *= u.y;
            this.z *= u.z;
            return this;
        }

        div(...args) {
            let u = this._arg2v(...args);
            if (u.x) this.x /= u.x;
            else this.x = 0;
            if (u.y) this.y /= u.y;
            else this.y = 0;
            if (u.z) this.z /= u.z;
            else this.z = 0;
            return this;
        }

        mag() {
            this._calcNorm();
            return this._cn;
        }

        magSq() {
            this._calcNorm();
            return this._cnsq;
        }

        dot(...args) {
            let u = this._arg2v(...args);
            return this.x * u.x + this.y * u.y + this.z * u.z;
        }

        dist(...args) {
            let u = this._arg2v(...args);
            let x = this.x - u.x;
            let y = this.y - u.y;
            let z = this.z - u.z;
            return Math.sqrt(x * x + y * y + z * z);
        }

        cross(...args) {
            let u = this._arg2v(...args);
            let x = this.y * u.z - this.z * u.y;
            let y = this.z * u.x - this.x * u.z;
            let z = this.x * u.y - this.y * u.x;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        normalize() {
            this._calcNorm();
            let n = this._cn;
            if (n != 0) {
                this.x /= n;
                this.y /= n;
                this.z /= n;
            }
            this._cn = 1;
            this._cnsq = 1;
            return this;
        }

        limit(m) {
            this._calcNorm();
            let n = this._cn;
            if (n > m) {
                let t = m / n;
                this.x *= t;
                this.y *= t;
                this.z *= t;
                this._cn = m;
                this._cnsq = m * m;
            }
            return this;
        }

        setMag(m) {
            this._calcNorm();
            let n = this._cn;
            let t = m / n;
            this.x *= t;
            this.y *= t;
            this.z *= t;
            this._cn = m;
            this._cnsq = m * m;
            return this;
        }

        heading() {
            return Math.atan2(this.y, this.x);
        }

        rotate(ang) {
            let costh = Math.cos(ang);
            let sinth = Math.sin(ang);
            let vx = this.x * costh - this.y * sinth;
            let vy = this.x * sinth + this.y * costh;
            this.x = vx;
            this.y = vy;
            return this;
        }

        angleBetween(...args) {
            let u = this._arg2v(...args);
            let o = Vector.cross(this, u);
            let ang = Math.atan2(o.mag(), this.dot(u));
            return ang * Math.sign(o.z || 1);
        }

        lerp(...args) {
            let amt = args.pop();
            let u = this._arg2v(...args);
            this.x += (u.x - this.x) * amt;
            this.y += (u.y - this.y) * amt;
            this.z += (u.z - this.z) * amt;
            return this;
        }

        reflect(n) {
            n.normalize();
            return this.sub(n.mult(2 * this.dot(n)));
        }

        array() {
            return [this.x, this.y, this.z];
        }

        equals(u, epsilon = Number.EPSILON) {
            return Math.abs(u.x - this.x) < epsilon && Math.abs(u.y - this.y) < epsilon && Math.abs(u.z - this.z) < epsilon;
        }

        static fromAngle(th, l = 1) {
            let v = new Vector();
            v.x = l * Math.cos(th);
            v.y = l * Math.sin(th);
            v.z = 0;
            v._cn = l;
            v._cnsq = l * l;
            return v;
        }

        static fromAngles(th, ph, l = 1) {
            let v = new Vector();
            const cosph = Math.cos(ph);
            const sinph = Math.sin(ph);
            const costh = Math.cos(th);
            const sinth = Math.sin(th);
            v.x = l * sinth * sinph;
            v.y = -l * costh;
            v.z = l * sinth * cosph;
            v._cn = l;
            v._cnsq = l * l;
            return v;
        }

        static random2D() {
            return Vector.fromAngle(Math.random() * Math.PI * 2);
        }

        static random3D() {
            return Vector.fromAngles(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        }

        static add(v, u) {
            return v.copy().add(u);
        }

        static cross(v, u) {
            return v.copy().cross(u);
        }

        static dist(v, u) {
            return Math.hypot(v.x - u.x, v.y - u.y, v.z - u.z);
        }

        static div(v, u) {
            return v.copy().div(u);
        }

        static dot(v, u) {
            return v.dot(u);
        }

        static equals(v, u, epsilon) {
            return v.equals(u, epsilon);
        }

        static lerp(v, u, amt) {
            return v.copy().lerp(u, amt);
        }

        static limit(v, m) {
            return v.copy().limit(m);
        }

        static heading(v) {
            return Math.atan2(v.y, v.x);
        }

        static magSq(v) {
            return v.x * v.x + v.y * v.y + v.z * v.z;
        }

        static mag(v) {
            return Math.sqrt(Vector.magSq(v));
        }

        static mult(v, u) {
            return v.copy().mult(u);
        }

        static normalize(v) {
            return v.copy().normalize();
        }

        static rem(v, u) {
            return v.copy().rem(u);
        }

        static sub(v, u) {
            return v.copy().sub(u);
        }
    }

    $.createVector = function (x, y, z) {
        return new Vector(x, y, z);
    };

    $.Vector = Vector;

    if ($._globalSketch) {
        globalScope.T5.Vector = Vector;
        globalScope.T5.createVector = $.createVector;
        globalScope.t5 = globalScope.t5 || {};
        globalScope.t5.Vector = Vector;
        globalScope.t5.createVector = $.createVector;
        globalScope.p5 = globalScope.p5 || {};
        globalScope.p5.Vector = Vector;
        globalScope.p5.createVector = $.createVector;
        globalScope.Q5 = globalScope.p5 || {};
        globalScope.Q5.Vector = Vector;
        globalScope.Q5.createVector = $.createVector;
    }
};

// Integrate the vector add-on
T5.addOns.vector(T5.prototype, T5.prototype, window);