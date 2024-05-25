/*!
 * © 2024 Tezumie-aijs.io
 * Licensed under CC BY-NC 4.0
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

//**********************************************************************//
//********************************-PRNG-********************************//
//**********************************************************************//

class PRNG {
    constructor(seed) {
        this.seed = seed;
        this.m = 0x80000000;
        this.a = 1103515245;
        this.c = 12345;
        this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }

    nextInt() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    nextFloat() {
        return this.nextInt() / (this.m - 1);
    }

    random(min, max) {
        if (min === undefined) {
            return this.nextFloat();
        }
        if (Array.isArray(min)) {
            return min[Math.floor(this.nextFloat() * min.length)];
        }
        if (typeof min === 'object') {
            const keys = Object.keys(min);
            return min[keys[Math.floor(this.nextFloat() * keys.length)]];
        }
        if (max === undefined) {
            return this.nextFloat() * min;
        }
        return this.nextFloat() * (max - min) + min;
    }
}

class Noise {
    constructor(seed) {
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.p = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
        if (seed !== undefined) {
            const prng = new PRNG(seed);
            this.p = Array.from({ length: 256 }, () => Math.floor(prng.nextFloat() * 256));
        }
        this.perm = Array.from({ length: 512 }, (_, i) => this.p[i & 255]);
    }

    dot(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    mix(a, b, t) {
        return (1 - t) * a + t * b;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        const grad3 = this.grad3;
        const perm = this.perm;

        const dot = this.dot.bind(this);
        const mix = this.mix.bind(this);

        const lerp1 = mix(dot(grad3[perm[AA] % 12], x, y, z), dot(grad3[perm[BA] % 12], x - 1, y, z), u);
        const lerp2 = mix(dot(grad3[perm[AB] % 12], x, y - 1, z), dot(grad3[perm[BB] % 12], x - 1, y - 1, z), u);
        const lerp3 = mix(dot(grad3[perm[AA + 1] % 12], x, y, z - 1), dot(grad3[perm[BA + 1] % 12], x - 1, y, z - 1), u);
        const lerp4 = mix(dot(grad3[perm[AB + 1] % 12], x, y - 1, z - 1), dot(grad3[perm[BB + 1] % 12], x - 1, y - 1, z - 1), u);

        const mix1 = mix(lerp1, lerp2, v);
        const mix2 = mix(lerp3, lerp4, v);

        return mix(mix1, mix2, w);
    }
}

//**************************************************************************//
//********************************-T5Canvas-********************************//
//**************************************************************************//

class T5Canvas {
    constructor() {
        // Initialize properties
        window.windowWidth = window.innerWidth;
        window.windowHeight = window.innerHeight;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 't5Canvas';
        this.context = null;
        this.offscreenBuffers = {};
        this.currentBuffer = null;
        this.fillStyle = '#ffffff';
        this.strokeStyle = '#000000';
        this.strokeWidth = 1;
        this.strokeType = 'solid';
        this.borderRadii = [];
        this.backgroundColor = '#ffffff';
        this.noiseGenerator = new Noise();
        this.randomGenerator = new PRNG();
        this.backgroundSet = false;
        this.currentShape = null;
        this.textureImage = null;
        this.textureMode = 'cover';
        this.textureCache = {};
        this.scaledTextureCache = {};
        this.assetsLoaded = false;
        this.assetsToLoad = 0;
        this.assetsLoadedCount = 0;
        this.matrixStack = [];
        this.frameRateValue = 60;
        window.frameCount = 0;
        window.deltaTime = 0;
        this.lastFrameTime = performance.now();
        this.loopActive = true;
        this.drawOnce = false;
        this.pixelDensityValue = window.devicePixelRatio || 1;
        this.dimensionAgnosticMode = false;
        this.dimensionUnit = 400;
        this.eraseMode = false;
        this.eraseFillStrength = 255;
        this.eraseStrokeStrength = 255;
        this.resizeCallbacks = [];
        this.initialized = false;
        window.addEventListener('load', () => this._start());
        window.addEventListener('resize', () => this._handleResize());
    }

    createCanvas(w, h) {
        if (this.initialized) {
            return;
        }
        this._setCanvasSize(w, h);
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this._updateGlobalDimensions();
        registerWindowResized(() => windowResized());
        return this.canvas;
    }

    resizeCanvas(w, h) {
        this._setCanvasSize(w, h);
        this._updateGlobalDimensions();
    }

    _setCanvasSize(w, h) {
        const d = this.pixelDensityValue;
        this.canvas.width = w * d;
        this.canvas.height = h * d;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
    }

    pixelDensity(val) {
        if (val === undefined) {
            return this.pixelDensityValue;
        } else {
            this.pixelDensityValue = val;
            if (this.canvas) {
                this._setCanvasSize(this.canvas.width / this.pixelDensityValue, this.canvas.height / this.pixelDensityValue);
            }
        }
        strokeWeight(this.strokeWidth);
        this._setCanvasSize(this.canvas.width, this.canvas.height);
    }

    _updateGlobalDimensions() {
        if (this.dimensionAgnosticMode) {
            window.width = this.dimensionUnit;
            window.height = (this.dimensionUnit / this.canvas.width) * this.canvas.height;
        } else {
            window.width = this.canvas.width / this.pixelDensityValue;
            window.height = this.canvas.height / this.pixelDensityValue;
        }
    }

    dimensionAgnostic(enabled, unit = 400) {
        this.dimensionAgnosticMode = enabled;
        this.dimensionUnit = unit;
        this._updateGlobalDimensions();
        this._updateBufferDimensions();
    }

    _updateBufferDimensions() {
        for (const key in this.offscreenBuffers) {
            const buffer = this.offscreenBuffers[key];
            if (this.dimensionAgnosticMode) {
                buffer.width = this.dimensionUnit;
                buffer.height = (this.dimensionUnit / buffer.buffer.width) * buffer.buffer.height;
            } else {
                buffer.width = buffer.buffer.width / this.pixelDensityValue;
                buffer.height = buffer.buffer.height / this.pixelDensityValue;
            }
        }
    }

    createBuffer(w, h) {
        const buffer = document.createElement('canvas');
        buffer.width = w
        buffer.height = h
        const context = buffer.getContext('2d');
        const id = this.randomGenerator.random().toString(36).substr(2, 9);
        this.offscreenBuffers[id] = { buffer, context, width: w, height: h };
        this._updateBufferDimensions();
        return this.offscreenBuffers[id];
    }

    saveCanvas(filename = 'untitled', extension = 'png') {
        if (!this.canvas) return;

        const validExtensions = ['png', 'jpg'];
        if (!validExtensions.includes(extension)) {
            console.error(`Invalid extension: ${extension}. Valid extensions are 'png' and 'jpg'.`);
            return;
        }

        const mimeType = extension === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataURL = this.canvas.toDataURL(mimeType);

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${filename}.${extension}`;
        link.click();
    }

    disableContextMenu() {
        if (this.canvas) {
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }

    noLoop() {
        this.loopActive = false;
    }

    loop() {
        this.loopActive = true;
        this._drawLoop();
    }

    _drawLoop() {
        if (!this.loopActive) return;

        const now = performance.now();
        window.deltaTime = now - this.lastFrameTime;

        if (window.deltaTime >= 1000 / this.frameRateValue) {
            this.lastFrameTime = now - (window.deltaTime % (1000 / this.frameRateValue));
            window.frameCount++;

            if (typeof draw === 'function') {
                draw();
            }
        }

        requestAnimationFrame(() => this._drawLoop());
    }

    frameRate(value) {
        if (value !== undefined) {
            this.frameRateValue = value;
        }
        return this.frameRateValue;
    }

    _start() {
        if (typeof preload === 'function') {
            preload();
        }
        this._initializeCanvas();
    }

    _initializeCanvas() {
        const checkReady = () => {
            if (this.assetsLoadedCount === this.assetsToLoad) {
                if (typeof setup === 'function') setup();
                this.strokeWidth = this._scaleCoordinate(this.strokeWidth);
                this.initialized = true;
                if (typeof draw === 'function') {
                    if (this.loopActive) {
                        this._drawLoop();
                    } else {
                        draw();
                    }
                }
            } else {
                requestAnimationFrame(checkReady);
            }
        };
        checkReady();
    }

    _handleResize() {
        window.windowWidth = window.innerWidth;
        window.windowHeight = window.innerHeight;
        for (const callback of this.resizeCallbacks) {
            callback();
        }
    }

    windowResized(callback) {
        this.resizeCallbacks.push(callback);
    }

    drawToBuffer(buffer) {
        if (buffer) {
            this.currentBuffer = buffer;
            this.context = buffer.context;
        } else {
            this.currentBuffer = null;
            this.context = this.canvas.getContext('2d');
        }
    }

    drawToCanvas() {
        this.currentBuffer = null;
        this.context = this.canvas.getContext('2d');
    }

    fill(...args) {
        this.fillStyle = this._processColorArgs(args);
        this.textureImage = null;
    }

    noFill() {
        this.fillStyle = null;
        this.textureImage = null;
    }

    stroke(...args) {
        this.strokeStyle = this._processColorArgs(args);
    }

    noStroke() {
        this.strokeStyle = null;
    }

    setStrokeType(type) {
        this.strokeType = type;
    }

    strokeWeight(weight) {
        if (weight <= 0) {
            this.strokeStyle = null;
        } else {
            this.strokeWidth = this._scaleCoordinate(weight);
        }
    }

    background(...args) {
        this.backgroundColor = this._processColorArgs(args);
        this.backgroundSet = true;
        this._drawBackground();
    }

    borderRadius(...radii) {
        this.borderRadii = radii;
    }

    loadImage(path, callback) {
        const img = new Image();
        const self = this;
        const req = new Request(path, {
            method: 'GET',
            mode: 'cors'
        });

        fetch(req).then(function (response) {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.blob();
        }).then(function (blob) {
            const url = URL.createObjectURL(blob);
            img.src = url;

            img.onload = function () {
                self.textureCache[path] = img;
                self.assetsLoadedCount++;
                if (callback) {
                    callback(img);
                } else {
                    self.textureImg = img;
                }
                URL.revokeObjectURL(url);
            };

            img.onerror = function (e) {
                console.error(`Failed to load image: ${path}`, e);
                self.assetsLoadedCount++;
                if (callback) {
                    callback(null);
                }
            };
        }).catch(function (e) {
            console.error(`Failed to fetch image: ${path}`, e);
            if (callback) {
                callback(null);
            }
        });

        this.assetsToLoad++;
        return img;
    }

    setTexture(imageOrBuffer, mode = 'cover') {
        this.textureMode = mode;
        if (imageOrBuffer instanceof HTMLCanvasElement) {
            this.textureImage = imageOrBuffer;
        } else if (typeof imageOrBuffer === 'string') {
            this.textureImage = this.textureCache[imageOrBuffer];
        } else if (imageOrBuffer instanceof HTMLImageElement) {
            this.textureImage = imageOrBuffer;
        }
        this.fillStyle = null;
    }

    image(img, x, y, width, height = width, mode = 'cover') {
        this.setTexture(img, mode);
        this.rect(x, y, width, height);
    }

    beginShape() {
        this.currentShape = [];
    }

    endShape(close = true) {
        if (!this.currentShape) return;
        const ctx = this.context;

        ctx.beginPath();
        if (this.borderRadii.length > 0) {
            this._drawPathWithBorderRadius(ctx, this.currentShape, close);
        } else {
            this._drawPath(ctx, this.currentShape, close);
        }

        if (this.textureImage) {
            const boundingBox = this._getBoundingBox(this.currentShape);
            const cacheKey = `${this.textureImage.src || this.randomGenerator.random()}-${boundingBox.width}-${boundingBox.height}-${this.textureMode}`;

            if (!this.scaledTextureCache[cacheKey]) {
                this.scaledTextureCache[cacheKey] = this._createScaledTexture(this.textureImage, this.textureMode, boundingBox);
            }

            ctx.save();
            ctx.clip();
            ctx.drawImage(this.scaledTextureCache[cacheKey], boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
            ctx.restore();
        } else if (this.fillStyle && !this.eraseMode) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        } else if (this.eraseMode) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.eraseFillStrength / 255})`;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        if (this.strokeStyle && !this.eraseMode) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.strokeWidth;
            ctx.stroke();
        } else if (this.eraseMode) {
            ctx.strokeStyle = `rgba(0, 0, 0, ${this.eraseStrokeStrength / 255})`;
            ctx.lineWidth = this.strokeWidth;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }

        this.currentShape = null;
    }

    viewBuffer(buffer, x = 0, y = 0) {
        if (buffer && buffer.buffer) {
            this.context.drawImage(buffer.buffer, this._scaleCoordinate(x), this._scaleCoordinate(y));
        }
    }

    hideBuffer() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._drawBackground();
    }

    _drawPath(ctx, vertices, close) {
        if (vertices.length < 2) return;

        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1, len = vertices.length; i < len; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        if (close) {
            ctx.closePath();
        }
    }

    _drawPathWithBorderRadius(ctx, vertices, close) {
        if (vertices.length < 2) return;

        const firstVertex = vertices[0];
        const lastVertex = vertices[vertices.length - 1];

        if (close && this.borderRadii.length > 0) {
            const radius = this._getBorderRadius(0);
            const prevLine = this._calculateLine(lastVertex, firstVertex, radius);
            ctx.moveTo(prevLine.x1, prevLine.y1);
        } else {
            ctx.moveTo(firstVertex.x, firstVertex.y);
        }

        for (let i = 0, len = vertices.length; i < len; i++) {
            const currVertex = vertices[i];
            const nextVertex = vertices[(i + 1) % len];
            const prevVertex = vertices[(i - 1 + len) % len];

            const radius = this._getBorderRadius(i);
            if (radius > 0) {
                const prevLine = this._calculateLine(prevVertex, currVertex, radius);
                const nextLine = this._calculateLine(currVertex, nextVertex, radius);

                if (i > 0) {
                    ctx.lineTo(prevLine.x1, prevLine.y1);
                }

                ctx.quadraticCurveTo(currVertex.x, currVertex.y, nextLine.x0, nextLine.y0);
            } else {
                ctx.lineTo(currVertex.x, currVertex.y);
            }
        }

        if (close) {
            ctx.closePath();
        }
    }

    _calculateLine(p0, p1, radius) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const unitDx = dx / dist;
        const unitDy = dy / dist;

        return {
            x0: p0.x + unitDx * radius,
            y0: p0.y + unitDy * radius,
            x1: p1.x - unitDx * radius,
            y1: p1.y - unitDy * radius
        };
    }

    _getBorderRadius(index) {
        if (this.borderRadii.length === 0) return 0;
        let radius = this.borderRadii[Math.min(index, this.borderRadii.length - 1)];
        return this._scaleCoordinate(radius);
    }

    _createScaledTexture(image, mode, boundingBox) {
        const { width, height } = boundingBox;
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        patternCanvas.width = width;
        patternCanvas.height = height;

        patternContext.clearRect(0, 0, width, height);

        if (mode === 'cover') {
            patternContext.drawImage(image, 0, 0, width, height);
        } else if (mode === 'contain') {
            const scale = Math.min(width / image.width, height / image.height);
            const offsetX = (width - image.width * scale) / 2;
            const offsetY = (height - image.height * scale) / 2;
            patternContext.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);
        }

        return patternCanvas;
    }

    _getBoundingBox(vertices) {
        const xs = vertices.map(v => v.x);
        const ys = vertices.map(v => v.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    noise(x, y = 0, z = 0) {
        return this.noiseGenerator.noise(x, y, z);
    }

    random(min, max) {
        return this.randomGenerator.random(min, max);
    }

    randomSeed(seed) {
        this.randomGenerator = new PRNG(seed);
    }

    noiseSeed(seed) {
        this.noiseGenerator = new Noise(seed);
    }

    push() {
        const ctx = this.context;
        ctx.save();
        this.matrixStack.push({
            fillStyle: this.fillStyle,
            strokeStyle: this.strokeStyle,
            strokeWidth: this.strokeWidth,
            strokeType: this.strokeType,
            borderRadii: [...this.borderRadii],
            backgroundColor: this.backgroundColor,
            currentShape: this.currentShape,
            textureImage: this.textureImage,
            textureMode: this.textureMode,
        });
    }

    pop() {
        const ctx = this.context;
        ctx.restore();
        const state = this.matrixStack.pop();
        if (state) {
            this.fillStyle = state.fillStyle;
            this.strokeStyle = state.strokeStyle;
            this.strokeWidth = state.strokeWidth;
            this.strokeType = state.strokeType;
            this.borderRadii = state.borderRadii;
            this.backgroundColor = state.backgroundColor;
            this.currentShape = state.currentShape;
            this.textureImage = state.textureImage;
            this.textureMode = state.textureMode;
        }
    }

    applyMatrix(a, b, c, d, e, f) {
        this.context.transform(a, b, c, d, e, f);
    }

    resetMatrix() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    translate(x, y) {
        this.context.translate(this._scaleCoordinate(x), this._scaleCoordinate(y));
    }

    rotate(angle) {
        this.context.rotate(angle);
    }

    scale(sx, sy = sx) {
        this.context.scale(sx, sy);
    }

    shearX(angle) {
        this.context.transform(1, 0, Math.tan(angle), 1, 0, 0);
    }

    shearY(angle) {
        this.context.transform(1, Math.tan(angle), 0, 1, 0, 0);
    }

    _drawBackground() {
        if (this.backgroundSet) {
            this.context.fillStyle = this.backgroundColor;
            this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        }
    }

    vertex(x, y) {
        if (this.currentShape) {
            this.currentShape.push({ x: this._scaleCoordinate(x), y: this._scaleCoordinate(y) });
        }
    }

    point(x, y) {
        const ctx = this.context;
        ctx.beginPath();
        ctx.arc(this._scaleCoordinate(x), this._scaleCoordinate(y), this.strokeWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.strokeStyle;
        ctx.fill();
    }

    ellipse(x, y, width, height = width) {
        const ctx = this.context;
        ctx.beginPath();
        ctx.ellipse(
            this._scaleCoordinate(x),
            this._scaleCoordinate(y),
            (this._scaleCoordinate(width) / 2),
            (this._scaleCoordinate(height) / 2),
            0, 0, Math.PI * 2
        );

        if (this.textureImage) {
            const cacheKey = `${this.textureImage.src || this.randomGenerator.random()}-${width}-${height}-${this.textureMode}`;
            if (!this.scaledTextureCache[cacheKey]) {
                const patternCanvas = document.createElement('canvas');
                patternCanvas.width = this._scaleCoordinate(width);
                patternCanvas.height = this._scaleCoordinate(height);
                const patternContext = patternCanvas.getContext('2d');
                patternContext.clearRect(0, 0, this._scaleCoordinate(width), this._scaleCoordinate(height));

                if (this.textureMode === 'cover') {
                    patternContext.drawImage(this.textureImage, 0, 0, this._scaleCoordinate(width), this._scaleCoordinate(height));
                } else if (this.textureMode === 'contain') {
                    const scale = Math.min(this._scaleCoordinate(width) / this.textureImage.width, this._scaleCoordinate(height) / this.textureImage.height);
                    const offsetX = (this._scaleCoordinate(width) - this.textureImage.width * scale) / 2;
                    const offsetY = (this._scaleCoordinate(height) - this.textureImage.height * scale) / 2;
                    patternContext.drawImage(this.textureImage, offsetX, offsetY, this.textureImage.width * scale, this.textureImage.height * scale);
                }
                this.scaledTextureCache[cacheKey] = patternCanvas;
            }

            ctx.save();
            ctx.clip();
            ctx.drawImage(this.scaledTextureCache[cacheKey], this._scaleCoordinate(x) - (this._scaleCoordinate(width) / 2), this._scaleCoordinate(y) - (this._scaleCoordinate(height) / 2), this._scaleCoordinate(width), this._scaleCoordinate(height));
            ctx.restore();
        } else if (this.fillStyle && !this.eraseMode) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        } else if (this.eraseMode) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.eraseFillStrength / 255})`;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        if (this.strokeStyle && !this.eraseMode) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.strokeWidth;
            ctx.stroke();
        } else if (this.eraseMode) {
            ctx.strokeStyle = `rgba(0, 0, 0, ${this.eraseStrokeStrength / 255})`;
            ctx.lineWidth = this.strokeWidth;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    rect(x, y, width, height = width) {
        const ctx = this.context;
        const scaledX = this._scaleCoordinate(x);
        const scaledY = this._scaleCoordinate(y);
        const scaledWidth = this._scaleCoordinate(width);
        const scaledHeight = this._scaleCoordinate(height);

        if (this.borderRadii.length === 0 || (this.borderRadii.length === 1 && this.borderRadii[0] === 0)) {
            if (this.textureImage) {
                const cacheKey = `${this.textureImage.src || this.randomGenerator.random()}-${width}-${height}-${this.textureMode}`;
                if (!this.scaledTextureCache[cacheKey]) {
                    this.scaledTextureCache[cacheKey] = this._createScaledTexture(this.textureImage, this.textureMode, { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight });
                }
                ctx.save();
                ctx.beginPath();
                ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.clip();
                ctx.drawImage(this.scaledTextureCache[cacheKey], scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.restore();
            } else if (this.fillStyle && !this.eraseMode) {
                ctx.fillStyle = this.fillStyle;
                ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            } else if (this.eraseMode) {
                ctx.fillStyle = `rgba(0, 0, 0, ${this.eraseFillStrength / 255})`;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.globalCompositeOperation = 'source-over';
            }

            if (this.strokeStyle && !this.eraseMode) {
                ctx.strokeStyle = this.strokeStyle;
                ctx.lineWidth = this.strokeWidth;
                ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            } else if (this.eraseMode) {
                ctx.strokeStyle = `rgba(0, 0, 0, ${this.eraseStrokeStrength / 255})`;
                ctx.lineWidth = this.strokeWidth;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            this.beginShape();
            this.vertex(x, y);
            this.vertex(x + width, y);
            this.vertex(x + width, y + height);
            this.vertex(x, y + height);
            this.endShape(true);
        }
    }

    _scaleCoordinate(coord) {
        if (this.dimensionAgnosticMode) {
            return (coord / this.dimensionUnit) * this.canvas.width;
        }
        return coord * this.pixelDensityValue;
    }

    line(x, y, x2, y2) {
        this.beginShape();
        this.vertex(x, y);
        this.vertex(x2, y2);
        this.endShape(false);
    }

    quad(x1, y1, x2, y2, x3, y3, x4, y4) {
        this.beginShape();
        this.vertex(x1, y1);
        this.vertex(x2, y2);
        this.vertex(x3, y3);
        this.vertex(x4, y4);
        this.endShape(true);
    }

    triangle(x1, y1, x2, y2, x3, y3) {
        this.beginShape();
        this.vertex(x1, y1);
        this.vertex(x2, y2);
        this.vertex(x3, y3);
        this.endShape(true);
    }

    polygon(x, y, radius, verts) {
        const angleIncrement = (2 * Math.PI) / verts;
        this.beginShape();
        for (let i = 0; i < verts; i++) {
            const angle = i * angleIncrement;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            this.vertex(vx, vy);
        }
        this.endShape(true);
    }

    erase(fillStrength = 255, strokeStrength = 255) {
        this.eraseMode = true;
        this.eraseFillStrength = fillStrength;
        this.eraseStrokeStrength = strokeStrength;
    }

    noErase() {
        this.eraseMode = false;
    }

    clear() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _processColorArgs(args) {
        if (args.length === 1 && typeof args[0] === 'string') {
            return args[0];
        } else if (args.length === 1 && typeof args[0] === 'number') {
            return `rgba(${args[0]},${args[0]},${args[0]},1)`;
        } else if (args.length === 2) {
            return `rgba(${args[0]},${args[0]},${args[0]},${args[1] / 255})`;
        } else if (args.length === 3) {
            return `rgba(${args[0]},${args[1]},${args[2]},1)`;
        } else if (args.length === 4) {
            return `rgba(${args[0]},${args[1]},${args[2]},${args[3] / 255})`;
        } else {
            throw new Error('Invalid color format');
        }
    }
}
function windowResized() { }
// T5 instance
const myT5 = new T5Canvas();

const registerWindowResized = (callback) => myT5.windowResized(callback);
const resizeCanvas = (width, height) => myT5.resizeCanvas(width, height);
const frameRate = (value) => myT5.frameRate(value);
// Aliases for global scope
const drawingContext = myT5.canvas.getContext('2d');
const createCanvas = (width, height) => myT5.createCanvas(width, height);
const dimensionAgnostic = (enabled, unit) => myT5.dimensionAgnostic(enabled, unit);
const disableContextMenu = () => myT5.disableContextMenu();
const pixelDensity = (val) => myT5.pixelDensity(val);
const saveCanvas = (filename, extension) => myT5.saveCanvas(filename, extension);
const createBuffer = (width, height) => myT5.createBuffer(width, height);
const drawToBuffer = (buffer) => myT5.drawToBuffer(buffer);
const drawToCanvas = () => myT5.drawToCanvas();
const fill = (...args) => myT5.fill(...args);
const noFill = () => myT5.noFill();
const stroke = (...args) => myT5.stroke(...args);
const noStroke = () => myT5.noStroke();
const setStrokeType = (type) => myT5.setStrokeType(type);
const strokeWeight = (weight) => myT5.strokeWeight(weight);
const background = (...args) => myT5.background(...args);
const borderRadius = (...radii) => myT5.borderRadius(...radii);
const setTexture = (imageOrBuffer, mode) => myT5.setTexture(imageOrBuffer, mode);
const beginShape = () => myT5.beginShape();
const vertex = (x, y) => myT5.vertex(x, y);
const endShape = (close = true) => myT5.endShape(close);
const noise = (x, y = 0, z = 0) => myT5.noise(x, y, z);
const random = (min, max) => myT5.random(min, max);
const randomSeed = (seed) => myT5.randomSeed(seed);
const noiseSeed = (seed) => myT5.noiseSeed(seed);

const loadImage = (path, callback) => myT5.loadImage(path, callback);
const image = (img, x, y, width, height, mode) => myT5.image(img, x, y, width, height, mode);

const viewBuffer = (buffer, x = 0, y = 0) => myT5.viewBuffer(buffer, x, y);
const hideBuffer = () => myT5.hideBuffer();

const noLoop = () => myT5.noLoop();
const loop = () => myT5.loop();

const ellipse = (x, y, width, height) => myT5.ellipse(x, y, width, height);
const circle = (x, y, size) => myT5.ellipse(x, y, size, size);
const point = (x, y) => myT5.point(x, y);
const rect = (x, y, width, height) => myT5.rect(x, y, width, height);
const square = (x, y, size) => myT5.rect(x, y, size, size);
const line = (x, y, x2, y2) => myT5.line(x, y, x2, y2);
const triangle = (x1, y1, x2, y2, x3, y3) => myT5.triangle(x1, y1, x2, y2, x3, y3);
const quad = (x1, y1, x2, y2, x3, y3, x4, y4) => myT5.quad(x1, y1, x2, y2, x3, y3, x4, y4);
const polygon = (x, y, radius, verts) => myT5.polygon(x, y, radius, verts);

const erase = (fillStrength, strokeStrength) => myT5.erase(fillStrength, strokeStrength);
const noErase = () => myT5.noErase();
const clear = () => myT5.clear();


// Mathematical constants
const PI = Math.PI;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;

// Trigonometric functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const acos = Math.acos;
const asin = Math.asin;
const atan = Math.atan;
const atan2 = Math.atan2;

// Angle conversion
const radians = (degrees) => degrees * (Math.PI / 180);
const degrees = (radians) => radians * (180 / Math.PI);

// Linear interpolation
const lerp = (start, stop, amt) => start + (stop - start) * amt;
const norm = (value, start, stop) => (value - start) / (stop - start);

// Mapping a range of values
const map = (value, start1, stop1, start2, stop2) => start2 + ((value - start1) / (stop1 - start1)) * (stop2 - start2);

// Distance calculation
const dist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// Constrain a number to a range
const constrain = (n, low, high) => Math.max(Math.min(n, high), low);

// Mathematical functions
const max = (...values) => Math.max(...values);
const min = (...values) => Math.min(...values);
const abs = (value) => Math.abs(value);
const floor = (value) => Math.floor(value);
const ceil = (value) => Math.ceil(value);
const round = (value) => Math.round(value);
const sq = (value) => value * value;
// const fract = (value) => value - Math.floor(value); 

// Exponential functions
const exp = (value) => Math.exp(value);
const log = (value) => Math.log(value);
const pow = (base, exp) => Math.pow(base, exp);
const sqrt = (value) => Math.sqrt(value);
// const mag = (x, y) => Math.sqrt(x * x + y * y); 

// Type conversion functions
const float = (value) => parseFloat(value);
const int = (value) => parseInt(value, 10);
const str = (value) => String(value);
const boolean = (value) => Boolean(value);
const byte = (value) => value & 0xFF;
const char = (value) => String.fromCharCode(value);
const unchar = (value) => value.charCodeAt(0);
const hex = (value, digits = 2) => value.toString(16).padStart(digits, '0');
const unhex = (value) => parseInt(value, 16);

// Time & Date Functions
const day = () => new Date().getDate();
const hour = () => new Date().getHours();
const minute = () => new Date().getMinutes();
const millis = () => new Date().getTime();
const month = () => new Date().getMonth() + 1;
const second = () => new Date().getSeconds();
const year = () => new Date().getFullYear();

// Array Functions
const append = (array, value) => {
    array.push(value);
    return array;
};

const arrayCopy = (src, srcPos = 0, dst = [], dstPos = 0, length = src.length) => {
    for (let i = 0; i < length; i++) {
        dst[dstPos + i] = src[srcPos + i];
    }
    return dst;
};

const concat = (...arrays) => {
    return [].concat(...arrays);
};

const reverse = (array) => {
    return array.slice().reverse();
};

const shorten = (array) => {
    array.pop();
    return array;
};

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(this.randomGenerator.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const sort = (array, compareFunction) => {
    return array.slice().sort(compareFunction);
};

const splice = (array, start, deleteCount, ...items) => {
    return array.splice(start, deleteCount, ...items);
};

const subset = (array, start, count) => {
    return array.slice(start, start + count);
};

// Utility functions
const push = () => myT5.push();
const pop = () => myT5.pop();
const translate = (x, y) => myT5.translate(x, y);
const rotate = (angle) => myT5.rotate(angle);
const scale = (sx, sy) => myT5.scale(sx, sy);
const resetMatrix = () => myT5.resetMatrix();
const applyMatrix = (a, b, c, d, e, f) => myT5.applyMatrix(a, b, c, d, e, f);
const shearX = (angle) => myT5.shearX(angle);
const shearY = (angle) => myT5.shearY(angle);


// Color functions
function color(r, g, b, a) {
    if (typeof r === 'string') {
        return parseColorString(r);
    } else if (typeof r === 'number' && g === undefined) {
        return `rgba(${r},${r},${r},1)`;
    } else if (typeof r === 'number' && typeof g === 'number' && b === undefined) {
        return `rgba(${r},${r},${r},${g / 255})`;
    } else if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number') {
        a = a === undefined ? 255 : a;
        return `rgba(${r},${g},${b},${a / 255})`;
    }
    throw new Error('Invalid color format');
}

function parseColorString(colorStr) {
    colorStr = colorStr.trim();
    if (colorStr.startsWith('#')) {
        if (colorStr.length === 7) {
            return hex6ToRgba(colorStr);
        } else if (colorStr.length === 9) {
            return hex8ToRgba(colorStr);
        } else if (colorStr.length === 4) {
            return hex3ToRgba(colorStr);
        }
    } else if (colorStr.startsWith('rgb') || colorStr.startsWith('rgba')) {
        return colorStr;
    }
    throw new Error('Invalid color string format');
}

function hex6ToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},1)`;
}

function hex8ToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    return `rgba(${r},${g},${b},${a})`;
}

function hex3ToRgba(hex) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    return `rgba(${r},${g},${b},1)`;
}

function red(c) {
    return getColorComponents(c).r;
}

function green(c) {
    return getColorComponents(c).g;
}

function blue(c) {
    return getColorComponents(c).b;
}

function alpha(c) {
    return getColorComponents(c).a;
}
function lerpColor(c1, c2, amt) {
    const color1 = getColorComponents(c1);
    const color2 = getColorComponents(c2);

    const r = Math.round(lerp(color1.r, color2.r, amt));
    const g = Math.round(lerp(color1.g, color2.g, amt));
    const b = Math.round(lerp(color1.b, color2.b, amt));
    const a = lerp(color1.a, color2.a, amt) / 255;

    return `rgba(${r},${g},${b},${a})`;
}

function getColorComponents(c) {
    if (typeof c === 'string') {
        c = c.trim();
        if (c.startsWith('#')) {
            if (c.length === 7) {
                return hex6ToComponents(c);
            } else if (c.length === 9) {
                return hex8ToComponents(c);
            } else if (c.length === 4) {
                return hex3ToComponents(c);
            }
        } else if (c.startsWith('rgba') || c.startsWith('rgb')) {
            return rgbaStringToComponents(c);
        }
    }
    throw new Error('Invalid color format');
}

function hex6ToComponents(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
}

function hex8ToComponents(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16);
    return { r, g, b, a };
}

function hex3ToComponents(hex) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    return { r, g, b, a: 255 };
}

function rgbaStringToComponents(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? parseFloat(match[4]) * 255 : 255;
        return { r, g, b, a };
    }
    throw new Error('Invalid rgba string format');
}

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

//***********************************************************************//
//********************************-T5Dom-********************************//
//***********************************************************************//

class T5Element {
    constructor(element) {
        this.element = element;
        this._eventHandlers = {};
    }

    parent(parent) {
        if (parent === undefined) {
            return this.element.parentElement;
        } else {
            if (typeof parent === 'string') {
                document.getElementById(parent).appendChild(this.element);
            } else if (parent instanceof T5Element) {
                parent.element.appendChild(this.element);
            } else if (parent instanceof HTMLElement) {
                parent.appendChild(this.element);
            }
            return this;
        }
    }

    child(child) {
        if (child === undefined) {
            return Array.from(this.element.children).map(el => new T5Element(el));
        } else {
            if (typeof child === 'string') {
                this.element.appendChild(document.getElementById(child));
            } else if (child instanceof T5Element) {
                this.element.appendChild(child.element);
            } else if (child instanceof HTMLElement) {
                this.element.appendChild(child);
            }
            return this;
        }
    }

    id(id) {
        if (id === undefined) {
            return this.element.id;
        } else {
            this.element.id = id;
            return this;
        }
    }

    class(className) {
        if (className === undefined) {
            return this.element.className;
        } else {
            this.element.className = className;
            return this;
        }
    }

    addClass(className) {
        this.element.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }

    hasClass(className) {
        return this.element.classList.contains(className);
    }

    toggleClass(className) {
        this.element.classList.toggle(className);
        return this;
    }

    position(x, y, positionType = 'absolute') {
        if (x === undefined && y === undefined) {
            return { x: this.element.offsetLeft, y: this.element.offsetTop };
        } else {
            this.element.style.position = positionType;
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            return this;
        }
    }

    size(width, height) {
        if (width === undefined && height === undefined) {
            return { width: this.element.offsetWidth, height: this.element.offsetHeight };
        } else {
            if (width !== undefined) {
                this.element.style.width = `${width}px`;
            }
            if (height !== undefined) {
                this.element.style.height = `${height}px`;
            }
            return this;
        }
    }

    center(align = 'both') {
        this.element.style.position = 'absolute';
        if (align === 'both' || align === 'horizontal') {
            this.element.style.left = '50%';
            this.element.style.transform = 'translateX(-50%)';
        }
        if (align === 'both' || align === 'vertical') {
            this.element.style.top = '50%';
            this.element.style.transform += ' translateY(-50%)';
        }
        return this;
    }

    html(content, append = false) {
        if (content === undefined) {
            return this.element.innerHTML;
        } else {
            if (append) {
                this.element.innerHTML += content;
            } else {
                this.element.innerHTML = content;
            }
            return this;
        }
    }

    style(property, value) {
        if (value === undefined) {
            return this.element.style[property];
        } else {
            this.element.style[property] = value;
            return this;
        }
    }

    attribute(attr, value) {
        if (value === undefined) {
            return this.element.getAttribute(attr);
        } else {
            this.element.setAttribute(attr, value);
            return this;
        }
    }

    removeAttribute(attr) {
        this.element.removeAttribute(attr);
        return this;
    }

    value(value) {
        if (value === undefined) {
            return this.element.value;
        } else {
            this.element.value = value;
            return this;
        }
    }

    show() {
        this.element.style.display = '';
        return this;
    }

    hide() {
        this.element.style.display = 'none';
        return this;
    }

    _addEventListener(event, callback) {
        if (callback === false) {
            this.element.removeEventListener(event, this._eventHandlers[event]);
            delete this._eventHandlers[event];
        } else {
            this._eventHandlers[event] = callback;
            this.element.addEventListener(event, callback);
        }
    }

    mousePressed(callback) { return this._addEventListener('mousedown', callback), this; }
    doubleClicked(callback) { return this._addEventListener('dblclick', callback), this; }
    mouseWheel(callback) { return this._addEventListener('wheel', callback), this; }
    mouseReleased(callback) { return this._addEventListener('mouseup', callback), this; }
    mouseClicked(callback) { return this._addEventListener('click', callback), this; }
    mouseMoved(callback) { return this._addEventListener('mousemove', callback), this; }
    mouseOver(callback) { return this._addEventListener('mouseover', callback), this; }
    mouseOut(callback) { return this._addEventListener('mouseout', callback), this; }
    touchStarted(callback) { return this._addEventListener('touchstart', callback), this; }
    touchMoved(callback) { return this._addEventListener('touchmove', callback), this; }
    touchEnded(callback) { return this._addEventListener('touchend', callback), this; }
    dragOver(callback) { return this._addEventListener('dragover', callback), this; }
    dragLeave(callback) { return this._addEventListener('dragleave', callback), this; }
    drop(callback) { return this._addEventListener('drop', callback), this; }
    draggable() {
        this.element.draggable = true;
        return this;
    }

    on(event, callback) {
        this.element.addEventListener(event, callback);
        return this;
    }

    remove() {
        this.element.remove();
    }
}

class T5Dom {
    constructor() {
        this.elements = [];
    }

    select(selector) {
        const el = document.querySelector(selector);
        return el ? new T5Element(el) : null;
    }

    selectAll(selector) {
        const nodeList = document.querySelectorAll(selector);
        return Array.from(nodeList).map(el => new T5Element(el));
    }

    removeElements() {
        this.elements.forEach(el => el.remove());
        this.elements = [];
    }

    createElement(tag, html = '') {
        const el = document.createElement(tag);
        el.innerHTML = html;
        document.body.appendChild(el);
        const t5Element = new T5Element(el);
        this.elements.push(t5Element);
        return t5Element;
    }

    createDiv(html = '') { return this.createElement('div', html); }
    createP(html = '') { return this.createElement('p', html); }
    createSpan(html = '') { return this.createElement('span', html); }
    createImg(src, alt = '') {
        const img = this.createElement('img');
        img.attribute('src', src).attribute('alt', alt);
        return img;
    }
    createA(href, html = '') {
        const a = this.createElement('a', html);
        a.attribute('href', href);
        return a;
    }
    createSlider(min, max, value, step) {
        const slider = this.createElement('input');
        slider.attribute('type', 'range')
            .attribute('min', min)
            .attribute('max', max)
            .attribute('value', value)
            .attribute('step', step);
        return slider;
    }
    createButton(label, callback) {
        const button = this.createElement('button', label);
        button.on('click', callback);
        return button;
    }
    createCheckbox(label, checked) {
        const checkbox = this.createElement('input');
        checkbox.attribute('type', 'checkbox').attribute('checked', checked);
        const labelEl = this.createElement('label', label);
        labelEl.element.appendChild(checkbox.element);
        return checkbox;
    }
    createSelect(options) {
        const select = this.createElement('select');
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.innerHTML = option;
            select.element.appendChild(opt);
        });
        return select;
    }
    createRadio(name, options) {
        const radioGroup = this.createElement('div');
        options.forEach(option => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = option;
            const label = document.createElement('label');
            label.innerHTML = option;
            label.appendChild(radio);
            radioGroup.element.appendChild(label);
        });
        return radioGroup;
    }
    createColorPicker(value = '#000000') {
        const colorPicker = this.createElement('input');
        colorPicker.attribute('type', 'color').attribute('value', value);
        return colorPicker;
    }
    createInput(value = '', type = 'text') {
        const input = this.createElement('input');
        input.attribute('type', type).attribute('value', value);
        return input;
    }
    createFileInput(callback) {
        const fileInput = this.createElement('input');
        fileInput.attribute('type', 'file').on('change', callback);
        return fileInput;
    }
    createVideo(src) {
        const video = this.createElement('video');
        video.attribute('src', src).attribute('controls', true);
        return video;
    }
    createAudio(src) {
        const audio = this.createElement('audio');
        audio.attribute('src', src).attribute('controls', true);
        return audio;
    }
    createCapture() {
        const capture = this.createElement('video');
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            capture.element.srcObject = stream;
            capture.element.play();
        });
        return capture;
    }
}

// Alias DOM functions for global scope
const myT5Dom = new T5Dom();
const select = (selector) => myT5Dom.select(selector);
const selectAll = (selector) => myT5Dom.selectAll(selector);
const removeElements = () => myT5Dom.removeElements();
const createDiv = (html) => myT5Dom.createDiv(html);
const createP = (html) => myT5Dom.createP(html);
const createSpan = (html) => myT5Dom.createSpan(html);
const createImg = (src, alt) => myT5Dom.createImg(src, alt);
const createA = (href, html) => myT5Dom.createA(href, html);
const createSlider = (min, max, value, step) => myT5Dom.createSlider(min, max, value, step);
const createButton = (label, callback) => myT5Dom.createButton(label, callback);
const createCheckbox = (label, checked) => myT5Dom.createCheckbox(label, checked);
const createSelect = (options) => myT5Dom.createSelect(options);
const createRadio = (name, options) => myT5Dom.createRadio(name, options);
const createColorPicker = (value) => myT5Dom.createColorPicker(value);
const createInput = (value, type) => myT5Dom.createInput(value, type);
const createFileInput = (callback) => myT5Dom.createFileInput(callback);
const createVideo = (src) => myT5Dom.createVideo(src);
const createAudio = (src) => myT5Dom.createAudio(src);
const createCapture = () => myT5Dom.createCapture();
const createElement = (tag, html) => myT5Dom.createElement(tag, html);

//*************************************************************************//
//********************************-T5Input-********************************//
//*************************************************************************//

class T5Input {
    constructor(baseT5) {
        this.baseT5 = baseT5;
        this.keyIsPressed = false;
        this.key = '';
        this.keyCode = 0;
        this.mouseButton = '';
        this.mouseIsPressed = false;
        this.movedX = 0;
        this.movedY = 0;
        this._mouseX = 0;
        this._mouseY = 0;
        this._pmouseX = 0;
        this._pmouseY = 0;
        this._winMouseX = 0;
        this._winMouseY = 0;
        this._pwinMouseX = 0;
        this._pwinMouseY = 0;
        this._initEventListeners();
    }

    _initEventListeners() {
        document.addEventListener('keydown', (e) => this._keyPressed(e));
        document.addEventListener('keyup', (e) => this._keyReleased(e));
        document.addEventListener('keypress', (e) => this._keyTyped(e));
        document.addEventListener('mousemove', (e) => this._onmousemove(e));
        document.addEventListener('mousedown', (e) => this._onmousedown(e));
        document.addEventListener('mouseup', (e) => this._onmouseup(e));
        document.addEventListener('click', (e) => this._onclick(e));
        document.addEventListener('dblclick', (e) => this._doubleClicked(e));
        document.addEventListener('wheel', (e) => this._mouseWheel(e));
    }

    _keyPressed(e) {
        this.keyIsPressed = true;
        this.key = e.key;
        this.keyCode = e.keyCode;
        if (typeof window.keyPressed === 'function') {
            window.keyPressed(e);
        }
    }

    _keyReleased(e) {
        this.keyIsPressed = false;
        this.key = '';
        if (typeof window.keyReleased === 'function') {
            window.keyReleased(e);
        }
        this.keyCode = 0;
    }

    _keyTyped(e) {
        if (typeof window.keyTyped === 'function') {
            window.keyTyped(e);
        }
    }

    _onmousemove(e) {
        this._updateMouse(e);
        if (this.mouseIsPressed) {
            if (typeof window.mouseDragged === 'function') {
                window.mouseDragged(e);
            }
        } else {
            if (typeof window.mouseMoved === 'function') {
                window.mouseMoved(e);
            }
        }
    }

    _onmousedown(e) {
        this._updateMouse(e);
        this.mouseIsPressed = true;
        this.mouseButton = ['left', 'middle', 'right'][e.button];
        if (typeof window.mousePressed === 'function') {
            window.mousePressed(e);
        }
    }

    _onmouseup(e) {
        this._updateMouse(e);
        this.mouseIsPressed = false;
        if (typeof window.mouseReleased === 'function') {
            window.mouseReleased(e);
        }
    }

    _onclick(e) {
        this._updateMouse(e);
        this.mouseIsPressed = true;
        if (typeof window.mouseClicked === 'function') {
            window.mouseClicked(e);
        }
        this.mouseIsPressed = false;
    }

    _doubleClicked(e) {
        if (typeof window.doubleClicked === 'function') {
            window.doubleClicked(e);
        }
    }

    _mouseWheel(e) {
        if (typeof window.mouseWheel === 'function') {
            window.mouseWheel(e);
        }
    }

    _updateMouse(e) {
        if (e.changedTouches) return;
        const rect = this.baseT5.canvas.getBoundingClientRect();
        const canvasWidth = this.baseT5.canvas.width / this.baseT5.pixelDensityValue;
        const canvasHeight = this.baseT5.canvas.height / this.baseT5.pixelDensityValue;

        let displayedWidth, displayedHeight;
        const aspectRatioCanvas = canvasWidth / canvasHeight;
        const aspectRatioRect = rect.width / rect.height;

        if (aspectRatioCanvas > aspectRatioRect) {
            displayedWidth = rect.width;
            displayedHeight = rect.width / aspectRatioCanvas;
        } else {
            displayedWidth = rect.height * aspectRatioCanvas;
            displayedHeight = rect.height;
        }

        const offsetX = (rect.width - displayedWidth) / 2;
        const offsetY = (rect.height - displayedHeight) / 2;

        const sx = canvasWidth / displayedWidth;
        const sy = canvasHeight / displayedHeight;

        this._pmouseX = this._mouseX;
        this._pmouseY = this._mouseY;
        this._mouseX = (e.clientX - rect.left - offsetX) * sx;
        this._mouseY = (e.clientY - rect.top - offsetY) * sy;

        this._pwinMouseX = this._winMouseX;
        this._pwinMouseY = this._winMouseY;
        this._winMouseX = e.clientX;
        this._winMouseY = e.clientY;
    }

    keyIsDown(keyCode) {
        return this.keyIsPressed && this.keyCode === keyCode;
    }

    requestPointerLock() {
        if (this.baseT5.canvas) {
            this.baseT5.canvas.requestPointerLock();
        }
    }

    exitPointerLock() {
        document.exitPointerLock();
    }

    cursor(type = 'default', x = 0, y = 0) {
        const canvas = this.baseT5.canvas;
        const types = {
            ARROW: 'default',
            CROSS: 'crosshair',
            HAND: 'pointer',
            MOVE: 'move',
            TEXT: 'text',
            WAIT: 'wait'
        };

        if (types[type]) {
            canvas.style.cursor = types[type];
        } else if (type.startsWith('url(') || /\.(cur|gif|jpg|jpeg|png)$/.test(type)) {
            canvas.style.cursor = `url(${type}) ${x} ${y}, auto`;
        } else {
            canvas.style.cursor = type;
        }
    }

    noCursor() {
        const canvas = this.baseT5.canvas;
        canvas.style.cursor = 'none';
    }

    get mouseX() {
        return this._scaleCoordinate(this._mouseX);
    }

    get mouseY() {
        return this._scaleCoordinate(this._mouseY);
    }

    get pmouseX() {
        return this._scaleCoordinate(this._pmouseX);
    }

    get pmouseY() {
        return this._scaleCoordinate(this._pmouseY);
    }

    get winMouseX() {
        return this._scaleCoordinate(this._winMouseX);
    }

    get winMouseY() {
        return this._scaleCoordinate(this._winMouseY);
    }

    get pwinMouseX() {
        return this._scaleCoordinate(this._pwinMouseX);
    }

    get pwinMouseY() {
        return this._scaleCoordinate(this._pwinMouseY);
    }

    _scaleCoordinate(coord) {
        if (this.baseT5.dimensionAgnosticMode) {
            return (coord / this.baseT5.canvas.width * this.baseT5.pixelDensityValue) * this.baseT5.dimensionUnit;
        }
        return coord;
    }
}

const myT5Input = new T5Input(myT5);

const properties = [
    'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'winMouseX', 'winMouseY', 'pwinMouseX', 'pwinMouseY',
    'mouseButton', 'mouseIsPressed'
];

properties.forEach(prop => {
    Object.defineProperty(window, prop, {
        get: function () {
            return myT5Input[prop];
        }
    });
});

// Alias input functions for global scope
const keyIsPressed = () => myT5Input.keyIsPressed;
const key = () => myT5Input.key;
Object.defineProperty(window, 'keyCode', {
    get: function () {
        return myT5Input.keyCode;
    }
});
const keyIsDown = (code) => myT5Input.keyIsDown(code);
const movedX = () => myT5Input.movedX;
const movedY = () => myT5Input.movedY;
const requestPointerLock = () => myT5Input.requestPointerLock();
const exitPointerLock = () => myT5Input.exitPointerLock();
const cursor = (type, x, y) => myT5Input.cursor(type, x, y);
const noCursor = () => myT5Input.noCursor();

//************************************************************************//
//********************************-T5Text-********************************//
//************************************************************************//

class T5Text {
    constructor(baseT5) {
        this.baseT5 = baseT5;
        this.baseT5.textSize = 16;
        this.baseT5.textFont = 'Arial, sans-serif'; // Default font
        this.baseT5.textAlign = 'left';
        this.baseT5.textBaseline = 'alphabetic';
        this.baseT5.textLeading = 1.2;
        this.baseT5.textStyle = 'normal';
        this.baseT5.textWrap = 'word';
        this.baseT5.letterSpacing = 0;
    }

    textSize(size) {
        this.baseT5.textSize = size;
    }

    textFont(font) {
        this.baseT5.textFont = font;
    }

    textAlign(horizAlign, vertAlign = 'alphabetic') {
        this.baseT5.textAlign = horizAlign;
        this.baseT5.textBaseline = vertAlign;
    }

    textLeading(leading) {
        this.baseT5.textLeading = leading;
    }

    textStyle(style) {
        this.baseT5.textStyle = style;
    }

    textWrap(wrap) {
        this.baseT5.textWrap = wrap;
    }

    letterSpacing(spacing) {
        this.baseT5.letterSpacing = spacing;
    }

    textWidth(text) {
        const ctx = this.baseT5.context;
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            const spacing = this.baseT5._scaleCoordinate(this.baseT5.letterSpacing);
            let width = 0;
            for (let i = 0; i < text.length; i++) {
                width += ctx.measureText(text[i]).width + spacing;
            }
            return width - spacing;
        }
        return 0;
    }

    textAscent() {
        const ctx = this.baseT5.context;
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            return ctx.measureText('M').actualBoundingBoxAscent;
        }
        return 0;
    }

    textDescent() {
        const ctx = this.baseT5.context;
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            return ctx.measureText('g').actualBoundingBoxDescent;
        }
        return 0;
    }

    loadFont(path, callback) {
        const font = new FontFace('customFont', `url(${path})`);
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            if (callback) callback(loadedFont);
        }).catch((error) => {
            console.error('Error loading font:', error);
            if (callback) callback(null);
        });
    }

    text(text, x, y) {
        const ctx = this.baseT5.context;
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            ctx.textAlign = this.baseT5.textAlign;
            ctx.textBaseline = this.baseT5.textBaseline;
            ctx.fillStyle = this.baseT5.fillStyle;
            ctx.strokeStyle = this.baseT5.strokeStyle;

            const scaledX = this.baseT5._scaleCoordinate(x);
            const scaledY = this.baseT5._scaleCoordinate(y);

            if (this.baseT5.fillStyle) {
                ctx.fillText(text, scaledX, scaledY);
            }
            if (this.baseT5.strokeStyle) {
                ctx.lineWidth = this.baseT5.strokeWidth;
                ctx.strokeText(text, scaledX, scaledY);
            }
        }
    }

    multilineText(text, x, y, maxWidth) {
        const ctx = this.baseT5.context;
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            ctx.textAlign = this.baseT5.textAlign;
            ctx.textBaseline = this.baseT5.textBaseline;
            ctx.fillStyle = this.baseT5.fillStyle;
            ctx.strokeStyle = this.baseT5.strokeStyle;
            const spacing = this.baseT5._scaleCoordinate(this.baseT5.letterSpacing);

            const lines = this._wrapText(ctx, text, this.baseT5._scaleCoordinate(maxWidth));
            let lineHeight = this.baseT5._scaleCoordinate(this.baseT5.textSize) * this.baseT5.textLeading;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let currentY = y + i * lineHeight;
                let currentX = this.baseT5._scaleCoordinate(x);
                for (let j = 0; j < line.length; j++) {
                    if (this.baseT5.fillStyle) {
                        ctx.fillText(line[j], currentX, this.baseT5._scaleCoordinate(currentY));
                    }
                    if (this.baseT5.strokeStyle) {
                        ctx.lineWidth = this.baseT5.strokeWidth;
                        ctx.strokeText(line[j], currentX, this.baseT5._scaleCoordinate(currentY));
                    }
                    currentX += ctx.measureText(line[j]).width + spacing;
                }
            }
        }
    }

    _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

// T5Text instance link to T5 instance
const myT5Text = new T5Text(myT5);

// Alias text functions for global scope
const textSize = (size) => myT5Text.textSize(size);
const textFont = (font) => myT5Text.textFont(font);
const textAlign = (horizAlign, vertAlign) => myT5Text.textAlign(horizAlign, vertAlign);
const text = (content, x, y) => myT5Text.text(content, x, y);
const textWidth = (content) => myT5Text.textWidth(content);
const textLeading = (leading) => myT5Text.textLeading(leading);
const textLineHeight = (height) => myT5Text.textLineHeight(height);
const textStyle = (style) => myT5Text.textStyle(style);
const textAscent = () => myT5Text.textAscent();
const textDescent = () => myT5Text.textDescent();
const textWrap = (wrap) => myT5Text.textWrap(wrap);
const letterSpacing = (spacing) => myT5Text.letterSpacing(spacing);
const loadFont = (path, callback) => myT5Text.loadFont(path, callback);
const multilineText = (content, x, y, maxWidth) => myT5Text.multilineText(content, x, y, maxWidth);

// Horizontal alignment (textAlign):
//     'left' (default)
//     'right'
//     'center'
//     'start'
//     'end'

// Vertical alignment (textBaseline):
//     'top'
//     'hanging'
//     'middle'
//     'alphabetic' (default)
//     'ideographic'
//     'bottom'

//************************************************************************//
//********************************-T5Draw-********************************//
//************************************************************************//

class T5Draw {
    constructor(t5Instance) {
        this.t5 = t5Instance;
    }

    noiseLine(x1, y1, x2, y2, noiseScale = 0.1, noiseStrength = 10) {
        const distance = dist(x1, y1, x2, y2);
        const steps = Math.ceil(distance / 5);
        const linePoints = [];
        let noiseOffset = 0;
        const angle = atan2(y2 - y1, x2 - x1);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = lerp(x1, x2, t);
            const y = lerp(y1, y2, t);
            const noiseValue = noise(noiseOffset);
            const offset = (noiseValue - 0.5) * noiseStrength;
            const offsetX = cos(angle + HALF_PI) * offset;
            const offsetY = sin(angle + HALF_PI) * offset;

            linePoints.push({ x: x + offsetX, y: y + offsetY });
            noiseOffset += noiseScale;
        }

        this.t5.beginShape();
        linePoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(false);
    }

    noiseEllipse(x, y, width, height, noiseScale = 0.1, noiseStrength = 10) {
        const ellipsePoints = [];
        const step = TWO_PI / 50;
        let noiseOffset = 0;

        for (let angle = 0; angle < TWO_PI; angle += step) {
            const px = cos(angle) * width / 2;
            const py = sin(angle) * height / 2;

            const noiseValueX = noise(noiseOffset);
            const noiseValueY = noise(noiseOffset + 1000);
            const offsetX = (noiseValueX - 0.5) * noiseStrength;
            const offsetY = (noiseValueY - 0.5) * noiseStrength;

            ellipsePoints.push({ x: x + px + offsetX, y: y + py + offsetY });
            noiseOffset += noiseScale;
        }
        const firstPoint = ellipsePoints[0];
        ellipsePoints.push({ x: firstPoint.x, y: firstPoint.y });
        this.t5.beginShape();
        ellipsePoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(true);
    }

    noiseRect(x, y, width, height, noiseScale = 0.1, noiseStrength = 10) {
        const rectPoints = [];
        let noiseOffsetX = 0;
        let noiseOffsetY = 1000;
        const step = 5;

        const addNoisePoint = (px, py, scale) => {
            const noiseValueX = noise(noiseOffsetX);
            const noiseValueY = noise(noiseOffsetY);
            const offsetX = (noiseValueX - 0.5) * noiseStrength * scale;
            const offsetY = (noiseValueY - 0.5) * noiseStrength * scale;
            rectPoints.push({ x: px + offsetX, y: py + offsetY });
            noiseOffsetX += noiseScale;
            noiseOffsetY += noiseScale;
        };

        // Top edge
        for (let i = 0; i <= width; i += step) {
            const scale = 1 - Math.abs(i / width - 0.5) * 2;
            addNoisePoint(x + i, y, scale);
        }

        // Right edge
        for (let i = 0; i <= height; i += step) {
            const scale = 1 - Math.abs(i / height - 0.5) * 2;
            addNoisePoint(x + width, y + i, scale);
        }

        // Bottom edge
        for (let i = width; i >= 0; i -= step) {
            const scale = 1 - Math.abs(i / width - 0.5) * 2;
            addNoisePoint(x + i, y + height, scale);
        }

        // Left edge
        for (let i = height; i >= 0; i -= step) {
            const scale = 1 - Math.abs(i / height - 0.5) * 2;
            addNoisePoint(x, y + i, scale);
        }

        // Close the shape by connecting to the first point
        rectPoints.push(rectPoints[0]);

        this.t5.beginShape();
        rectPoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(true);
    }

    gradientFill(color1, color2, x, y, x2, y2) {
        const ctx = this.t5.context;
        const gradient = ctx.createLinearGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(x2),
            this.t5._scaleCoordinate(y2)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.fillStyle = gradient;
    }

    gradientStroke(color1, color2, x, y, x2, y2) {
        const ctx = this.t5.context;
        const gradient = ctx.createLinearGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(x2),
            this.t5._scaleCoordinate(y2)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.strokeStyle = gradient;
    }

    radialFill(color1, color2, x, y, radius) {
        const ctx = this.t5.context;
        const gradient = ctx.createRadialGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            0,
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(radius)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.fillStyle = gradient;
    }

    radialStroke(color1, color2, x, y, radius) {
        const ctx = this.t5.context;
        const gradient = ctx.createRadialGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            0,
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(radius)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.strokeStyle = gradient;
    }

    dynamicGradient(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const ctx = this.t5.context;
        let gradient;

        if (type === 'linear') {
            gradient = ctx.createLinearGradient(
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                this.t5._scaleCoordinate(x2),
                this.t5._scaleCoordinate(y2)
            );
        } else if (type === 'radial') {
            gradient = ctx.createRadialGradient(
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                0,
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                this.t5._scaleCoordinate(x2)
            );
        } else {
            throw new Error('Unsupported gradient type');
        }

        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        return gradient;
    }

    dynamicFill(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const gradient = this.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
        this.t5.fillStyle = gradient;
    }

    dynamicStroke(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const gradient = this.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
        this.t5.strokeStyle = gradient;
    }
}

const myT5Draw = new T5Draw(myT5);

// Aliases for global scope
const noiseLine = (x, y, x2, y2, noiseScale, noiseStrength) => myT5Draw.noiseLine(x, y, x2, y2, noiseScale, noiseStrength);
const noiseEllipse = (x, y, width, height, noiseScale, noiseStrength) => myT5Draw.noiseEllipse(x, y, width, height, noiseScale, noiseStrength);
const noiseRect = (x, y, width, height, noiseScale, noiseStrength) => myT5Draw.noiseRect(x, y, width, height, noiseScale, noiseStrength);
const gradientFill = (color1, color2, x, y, x2, y2) => myT5Draw.gradientFill(color1, color2, x, y, x2, y2);
const gradientStroke = (color1, color2, x, y, x2, y2) => myT5Draw.gradientStroke(color1, color2, x, y, x2, y2);
const radialFill = (color1, color2, x, y, radius) => myT5Draw.radialFill(color1, color2, x, y, radius);
const radialStroke = (color1, color2, x, y, radius) => myT5Draw.radialStroke(color1, color2, x, y, radius);
const dynamicGradient = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
const dynamicFill = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicFill(type, colorStops, x1, y1, x2, y2, r1, r2);
const dynamicStroke = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicStroke(type, colorStops, x1, y1, x2, y2, r1, r2);

//********************************-T5Webgl-********************************//
//********************************-T5Shaders-********************************//
//********************************-T5Physics-********************************//
//********************************-T5Sound-********************************//
