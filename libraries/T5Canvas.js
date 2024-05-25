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
