//************************************************************************//
//********************************-T5Math-********************************//
//************************************************************************//
T5.addOns.math = ($, p) => {
    // Constants
    $.defineConstant('PI', Math.PI);
    $.defineConstant('TWO_PI', Math.PI * 2);
    $.defineConstant('TAU', Math.PI * 2);
    $.defineConstant('HALF_PI', Math.PI / 2);
    $.defineConstant('QUARTER_PI', Math.PI / 4);
    $.defineConstant('E', Math.E);
    $.defineConstant('SIMPLEX', 'simplex');
    $.defineConstant('PERLIN', 'perlin');
    // Trigonometric functions
    $.sin = function (angle) {
        return Math.sin($.convertAngle(angle));
    };

    $.cos = function (angle) {
        return Math.cos($.convertAngle(angle));
    };

    $.tan = function (angle) {
        return Math.tan($.convertAngle(angle));
    };

    $.asin = function (value) {
        let angle = Math.asin(value);
        return $.currentAngleMode === "degrees" ? degrees(angle) : angle;
    };

    $.acos = function (value) {
        let angle = Math.acos(value);
        return $.currentAngleMode === "degrees" ? degrees(angle) : angle;
    };

    $.atan = function (value) {
        let angle = Math.atan(value);
        return $.currentAngleMode === "degrees" ? degrees(angle) : angle;
    };

    $.atan2 = function (y, x) {
        let angle = Math.atan2(y, x);
        return $.currentAngleMode === "degrees" ? degrees(angle) : angle;
    };

    // Rounding Functions
    $.floor = Math.floor;
    $.ceil = Math.ceil;
    $.round = Math.round;

    // Exponential and Logarithmic Functions
    $.exp = Math.exp;
    $.log = Math.log;
    $.pow = Math.pow;
    $.sqrt = Math.sqrt;
    $.sq = (x) => x * x;

    // Utility Functions
    $.abs = Math.abs;
    $.max = Math.max;
    $.min = Math.min;
    $.mag = Math.hypot;
    $.constrain = (n, low, high) => Math.max(Math.min(n, high), low);
    $.degrees = (radians) => radians * (180 / Math.PI);
    $.radians = (degrees) => degrees * (Math.PI / 180);
    $.map = (value, start1, stop1, start2, stop2) => start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    $.lerp = (start, stop, amt) => start + (stop - start) * amt;
    $.int = (n) => n < 0 ? Math.ceil(n) : Math.floor(n);
    $.dist = (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Pseudo-Random Number Generator (PRNG)
    let randomSeedValue = Math.floor(Math.random() * 123456789)
    let noiseSeedValue = Math.floor(Math.random() * 123456789)


    function seededRandom() {
        const x = Math.sin(randomSeedValue++) * 10000;
        return x - Math.floor(x);
    }

    $.randomSeed = function (seed) {
        randomSeedValue = seed;
    };

    $.random = function (min, max) {
        if (Array.isArray(min)) {
            const index = Math.floor(seededRandom() * min.length);
            return min[index];
        } else if (typeof min === 'undefined') {
            return seededRandom();
        } else if (typeof max === 'undefined') {
            return seededRandom() * min;
        } else {
            return seededRandom() * (max - min) + min;
        }
    };

    $.randomGaussian = (() => {
        let y2;
        let useLast = false;
        return () => {
            let y1, x1, x2, w;
            if (useLast) {
                y1 = y2;
                useLast = false;
            } else {
                do {
                    x1 = seededRandom() * 2 - 1;
                    x2 = seededRandom() * 2 - 1;
                    w = x1 * x1 + x2 * x2;
                } while (w >= 1);
                w = Math.sqrt((-2 * Math.log(w)) / w);
                y1 = x1 * w;
                y2 = x2 * w;
                useLast = true;
            }
            return y1;
        };
    })();

    class Noise {
        constructor() {
            this.octaves = 1;
            this.falloff = 0.5;
        }

        setDetail(lod, falloff) {
            this.octaves = lod;
            this.falloff = falloff;
        }
    }

    class PerlinNoise extends Noise {
        constructor(seed) {
            super();
            this.grad3 = [
                [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
            ];
            this.seed(seed || noiseSeedValue);
        }

        seed(seed) {
            this.p = this.buildPermutationTable(seed === undefined ? noiseSeedValue : seed);
            this.perm = this.p.concat(this.p);
        }

        buildPermutationTable(seed) {
            const p = [];
            for (let i = 0; i < 256; i++) {
                p[i] = i;
            }

            for (let i = 255; i > 0; i--) {
                seed = (seed * 16807) % 2147483647;
                const n = seed % (i + 1);
                [p[i], p[n]] = [p[n], p[i]];
            }

            return p;
        }

        dot(g, x, y, z) {
            return g ? (g[0] * x + g[1] * y + g[2] * z) : 0;
        }

        fade(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }

        noise(x, y, z = 0) {
            let total = 0;
            let freq = 1;
            let amp = 1;
            let maxAmp = 0;

            for (let i = 0; i < this.octaves; i++) {
                const X = Math.floor(x * freq) & 255;
                const Y = Math.floor(y * freq) & 255;
                const Z = Math.floor(z * freq) & 255;

                const xf = x * freq - Math.floor(x * freq);
                const yf = y * freq - Math.floor(y * freq);
                const zf = z * freq - Math.floor(z * freq);

                const u = this.fade(xf);
                const v = this.fade(yf);
                const w = this.fade(zf);

                const A = this.perm[X] + Y;
                const AA = this.perm[A] + Z;
                const AB = this.perm[A + 1] + Z;
                const B = this.perm[X + 1] + Y;
                const BA = this.perm[B] + Z;
                const BB = this.perm[B + 1] + Z;

                const gradAA = this.grad3[this.perm[AA] % 12];
                const gradBA = this.grad3[this.perm[BA] % 12];
                const gradAB = this.grad3[this.perm[AB] % 12];
                const gradBB = this.grad3[this.perm[BB] % 12];
                const gradAA1 = this.grad3[this.perm[AA + 1] % 12];
                const gradBA1 = this.grad3[this.perm[BA + 1] % 12];
                const gradAB1 = this.grad3[this.perm[AB + 1] % 12];
                const gradBB1 = this.grad3[this.perm[BB + 1] % 12];

                const lerp1 = this.mix(this.dot(gradAA, xf, yf, zf), this.dot(gradBA, xf - 1, yf, zf), u);
                const lerp2 = this.mix(this.dot(gradAB, xf, yf - 1, zf), this.dot(gradBB, xf - 1, yf - 1, zf), u);
                const lerp3 = this.mix(this.dot(gradAA1, xf, yf, zf - 1), this.dot(gradBA1, xf - 1, yf, zf - 1), u);
                const lerp4 = this.mix(this.dot(gradAB1, xf, yf - 1, zf - 1), this.dot(gradBB1, xf - 1, yf - 1, zf - 1), u);

                const mix1 = this.mix(lerp1, lerp2, v);
                const mix2 = this.mix(lerp3, lerp4, v);

                total += this.mix(mix1, mix2, w) * amp;

                maxAmp += amp;
                amp *= this.falloff;
                freq *= 2;
            }

            return (total / maxAmp + 1) / 2;
        }

        mix(a, b, t) {
            return (1 - t) * a + t * b;
        }
    }
    // Simplex Noise
    class SimplexNoise extends Noise {
        constructor(seed) {
            super();
            this.grad3 = [
                [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
            ];
            this.F3 = 1.0 / 3.0;
            this.G3 = 1.0 / 6.0;
            this.seed(seed || noiseSeedValue);
        }

        seed(seed) {
            this.p = this.buildPermutationTable(seed === undefined ? noiseSeedValue : seed);
            this.perm = this.p.concat(this.p); // Extend the permutation table
        }

        buildPermutationTable(seed) {
            const p = [];
            for (let i = 0; i < 256; i++) {
                p[i] = i;
            }

            let n, q;
            for (let i = 255; i > 0; i--) {
                seed = (seed * 16807) % 2147483647;
                n = seed % (i + 1);
                q = p[i];
                p[i] = p[n];
                p[n] = q;
            }

            return p;
        }

        dot(g, x, y, z) {
            return g[0] * x + g[1] * y + g[2] * z;
        }

        noise(xin, yin, zin) {
            let total = 0;
            let freq = 1;
            let amp = 1;
            let maxAmp = 0;

            for (let i = 0; i < this.octaves; i++) {
                let n0, n1, n2, n3;
                let s = (xin * freq + yin * freq + zin * freq) * this.F3;
                let i = Math.floor(xin * freq + s);
                let j = Math.floor(yin * freq + s);
                let k = Math.floor(zin * freq + s);
                let t = (i + j + k) * this.G3;
                let X0 = i - t;
                let Y0 = j - t;
                let Z0 = k - t;
                let x0 = xin * freq - X0;
                let y0 = yin * freq - Y0;
                let z0 = zin * freq - Z0;

                let i1, j1, k1;
                let i2, j2, k2;

                if (x0 >= y0) {
                    if (y0 >= z0) {
                        i1 = 1;
                        j1 = 0;
                        k1 = 0;
                        i2 = 1;
                        j2 = 1;
                        k2 = 0;
                    } else if (x0 >= z0) {
                        i1 = 1;
                        j1 = 0;
                        k1 = 0;
                        i2 = 1;
                        j2 = 0;
                        k2 = 1;
                    } else {
                        i1 = 0;
                        j1 = 0;
                        k1 = 1;
                        i2 = 1;
                        j2 = 0;
                        k2 = 1;
                    }
                } else {
                    if (y0 < z0) {
                        i1 = 0;
                        j1 = 0;
                        k1 = 1;
                        i2 = 0;
                        j2 = 1;
                        k2 = 1;
                    } else if (x0 < z0) {
                        i1 = 0;
                        j1 = 1;
                        k1 = 0;
                        i2 = 0;
                        j2 = 1;
                        k2 = 1;
                    } else {
                        i1 = 0;
                        j1 = 1;
                        k1 = 0;
                        i2 = 1;
                        j2 = 1;
                        k2 = 0;
                    }
                }

                let x1 = x0 - i1 + this.G3;
                let y1 = y0 - j1 + this.G3;
                let z1 = z0 - k1 + this.G3;
                let x2 = x0 - i2 + 2.0 * this.G3;
                let y2 = y0 - j2 + 2.0 * this.G3;
                let z2 = z0 - k2 + 2.0 * this.G3;
                let x3 = x0 - 1.0 + 3.0 * this.G3;
                let y3 = y0 - 1.0 + 3.0 * this.G3;
                let z3 = z0 - 1.0 + 3.0 * this.G3;

                let ii = i & 255;
                let jj = j & 255;
                let kk = k & 255;

                let gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
                let gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
                let gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
                let gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;

                let t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
                if (t0 < 0) n0 = 0.0;
                else {
                    t0 *= t0;
                    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
                }

                let t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
                if (t1 < 0) n1 = 0.0;
                else {
                    t1 *= t1;
                    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
                }

                let t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
                if (t2 < 0) n2 = 0.0;
                else {
                    t2 *= t2;
                    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
                }

                let t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
                if (t3 < 0) n3 = 0.0;
                else {
                    t3 *= t3;
                    n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
                }

                total += 32.0 * (n0 + n1 + n2 + n3) * amp;

                maxAmp += amp;
                amp *= this.falloff;
                freq *= 2;
            }

            return (total / maxAmp + 1) / 2;
        }
    }

    // Initialize the noise generator with a random seed value
    let noiseGenerator;
    let noiseMode = "perlin";

    function initNoiseGenerator() {
        if (noiseMode === "simplex") {
            noiseGenerator = new SimplexNoise(noiseSeedValue);
        } else {
            noiseGenerator = new PerlinNoise(noiseSeedValue);
        }
    }

    $.noiseSeed = function (seed) {
        noiseSeedValue = seed;
        initNoiseGenerator();
    };

    $.noiseDetail = function (lod, falloff) {
        noiseGenerator.setDetail(lod, falloff);
    };

    $.noiseMode = function (mode) {
        noiseMode = mode;
        initNoiseGenerator();
    };

    $.noise = function (x, y = 0, z = 0) {
        return noiseGenerator.noise(x, y, z);
    };

    $.toRadians = (angle) => $.angleMode === DEGREES ? angle * (Math.PI / 180) : angle;
    $.toDegrees = (angle) => $.angleMode === RADIANS ? angle * (180 / Math.PI) : angle;
    $.noiseSeed(noiseSeedValue);
    $.randomSeed(randomSeedValue);
    initNoiseGenerator();

    $.shuffle = function (array, modify = false) {
        let arr = modify ? array : array.slice();
        let m = arr.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        return arr;
    };

    $.print = function (...args) {
        console.log(...args);
    };

};

T5.addOns.math(T5.prototype, T5.prototype);