/*!
 * © 2024 Tezumie-aijs.io
 * Licensed under CC BY-NC 4.0
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

window.t5PreloadCount = 0;
window.t5PreloadDone = 0;
window.windowWidth = window.innerWidth;
window.windowHeight = window.innerHeight;
p5 = T5;
T5.methods = {
    init: [],
    pre: [],
    post: [],
    remove: []
};
T5.prototype.registerPreloadMethod = (methodName, functionObject) => {
    T5.prototype[methodName] = functionObject[methodName];
};

T5.prototype.registerMethod = function (methodName, functionObject) {
    if (!T5.methods[methodName]) {
        T5.methods[methodName] = [];
    }
    T5.methods[methodName].push(functionObject);
};

function T5(scope = 'global', parent) {
    let $ = this;

    function setScope(scope) {
        if (scope === 'auto') {
            scope = (window.setup || window.draw) ? 'global' : 'local';
        }
        $._globalSketch = (scope === 'global');
        return $._globalSketch ? window : undefined;
    }

    const globalScope = setScope(scope);

    const proxy = new Proxy($, {
        set: (target, property, value) => {
            target[property] = value;
            if ($._globalSketch) globalScope[property] = value;
            return true;
        }
    });

    $.frameCount = 0;
    $.deltaTime = 16;
    $._setFrameRate = 60;
    $._frameLength = 1000 / $._setFrameRate;
    $._previousFrame = 0;
    $._isLooping = true;
    $._shouldDrawOnce = false;
    let millisBegin = performance.now();
    $.millis = () => performance.now() - millisBegin;
    $._incrementPreload = function () {
        window.t5PreloadCount++;
    };
    $._decrementPreload = function () {
        window.t5PreloadCount--;
    };

    $.frameRate = (rate) => {
        if (rate !== undefined) {
            $._setFrameRate = rate;
            $._frameLength = 1000 / $._setFrameRate;
        } else {
            return $._frameRate;
        }
    };

    function _draw() {
        for (let preMethod of T5.methods.pre) {
            preMethod.call($);
        }

        $.resetMatrix();
        let now = performance.now();
        $._previousFrame ??= now - $._frameLength;
        if ($._isLooping || $._shouldDrawOnce) {
            requestAnimationFrame(_draw);
        } else if ($.frameCount && !$._redraw) {
            return;
        }
        let timeSinceLast = now - $._previousFrame;
        if (timeSinceLast < $._frameLength - 1) return;

        $.deltaTime = now - $._previousFrame;
        $._frameRate = 1000 / $.deltaTime;
        $.frameCount++;
        window.frameCount = $.frameCount;
        window.deltaTime = $.deltaTime;
        if ($.context) $.context.save();
        if (typeof $.draw === 'function') $.draw();
        if ($.context) {
            let prevProps = {
                fillStyle: $.context.fillStyle,
                strokeStyle: $.context.strokeStyle,
                lineWidth: $.context.lineWidth,
                lineCap: $.context.lineCap,
                lineJoin: $.context.lineJoin,
                textAlign: $.context.textAlign,
                font: $.context.font,
                globalAlpha: $.context.globalAlpha,
                globalCompositeOperation: $.context.globalCompositeOperation,
                filter: $.context.filter,
                imageSmoothingEnabled: $.context.imageSmoothingEnabled
            };

            $.context.restore();

            $.context.fillStyle = prevProps.fillStyle;
            $.context.strokeStyle = prevProps.strokeStyle;
            $.context.lineWidth = prevProps.lineWidth;
            $.context.lineCap = prevProps.lineCap;
            $.context.lineJoin = prevProps.lineJoin;
            $.context.textAlign = prevProps.textAlign;
            $.context.font = prevProps.font;
            $.context.globalAlpha = prevProps.globalAlpha;
            $.context.globalCompositeOperation = prevProps.globalCompositeOperation;
            $.context.filter = prevProps.filter;
            $.context.imageSmoothingEnabled = prevProps.imageSmoothingEnabled;
        }

        $._previousFrame = now;
        $._shouldDrawOnce = false;
        for (let postMethod of T5.methods.post) {
            postMethod.call($);
        }
    }

    $.noLoop = () => { $._isLooping = false; };
    $.loop = () => { $._isLooping = true; };
    $.isLooping = () => $._isLooping;
    $.redraw = (n = 1) => {
        $._redraw = true;
        for (let i = 0; i < n; i++) {
            _draw();
        }
        $._redraw = false;
    };

    $.start = () => {

        if (typeof $.preload === 'function') {
            bindGlobals($)
            $.preload();
        }
        // Check if preload function exists and if there are items to preload
        if (typeof $.preload !== 'function' || window.t5PreloadCount === window.t5PreloadDone) {

            if (typeof $.setup === 'function') $.setup();

            if ($.frameCount === 0 && $.context === null) $.createCanvas(100, 100);
            $.resetMatrix();
            $._shouldDrawOnce = true;
            requestAnimationFrame(() => {
                _draw();
                if ($._isLooping) requestAnimationFrame(_draw);
            });
        } else {
            const checkPreloadDone = setInterval(() => {
                if (window.t5PreloadCount === window.t5PreloadDone) {
                    clearInterval(checkPreloadDone);
                    millisBegin = performance.now();
                    if (typeof $.setup === 'function') $.setup();

                    if ($.frameCount === 0 && $.context === null) $.createCanvas(100, 100);
                    $.resetMatrix();
                    $._shouldDrawOnce = true;
                    requestAnimationFrame(() => {
                        _draw();
                        if ($._isLooping) requestAnimationFrame(_draw);
                    });
                }
            }, 10);
        }
    };

    if ($._globalSketch) {
        for (let method of ['setup', 'draw', 'preload', 'windowResized']) {
            if (window[method]) $[method] = window[method];
        }
        for (let key in $) {
            if ($[key] instanceof Function) window[key] = $[key].bind($);
        }
    }

    document.addEventListener('DOMContentLoaded', $.start);

    if (T5.methods.init) {
        for (let initMethod of T5.methods.init) {
            if (typeof initMethod === 'function') {
                initMethod.call($);
            }
        }
    }

    for (let m in T5.addOns) {
        T5.addOns[m]($, proxy, globalScope);
    }

    function bindGlobals($) {
        for (let key in $) {
            if ($[key] instanceof Function) {
                window[key] = $[key].bind($);
            } else {
                window[key] = $[key];  // Bind non-function properties too
            }
        }
    }

    if ($._globalSketch) {
        globalScope.T5 = T5;
        window.addEventListener('resize', () => {
            window.windowWidth = window.innerWidth;
            window.windowHeight = window.innerHeight;
            if (typeof $.windowResized === 'function') $.windowResized();
        });

    }

}

T5.addOns = {};

if (typeof window === 'object') {
    window.T5 = T5;
    document.addEventListener('DOMContentLoaded', () => {
        if (!T5._hasGlobal) {
            const instance = new T5('global');
            p5 = T5

            instance.setup = window.setup;
            instance.draw = window.draw;
            instance.windowResized = window.windowResized;
            if (window.setup || window.draw) {
                instance.start();
            }
        }
    });
}
//************************************************************************//
//*******************************-T5Cenvas-*******************************//
//************************************************************************//
T5.addOns.canvas = ($, p) => {
    if (!$.t5PixelDensity) {
        $.t5PixelDensity = 1;
    }

    $._OffscreenCanvas =
        window.OffscreenCanvas ||
        function () {
            return document.createElement('canvas');
        };
    $.defineConstant = function (constantName, value) {
        const target = $._globalSketch ? window : $;
        Object.defineProperty(target, constantName, {
            value: value,
            writable: false,
            configurable: false
        });
    }
    $.scaleT5Coord = function (coord, mousePos = false) {
        if (!$.canvas) {
            return;
        }
        if (!$.dimensionUnit) {
            $.dimensionUnit = $.canvas.width / $.t5PixelDensity;
        }
        return (coord / $.dimensionUnit) * $.canvas.width / $.t5PixelDensity;
    };

    $.scaleT5Coords = function (coords, mousePos = false) {
        return coords.map(coord => $.scaleT5Coord(coord, mousePos));
    };

    $.scaleT5Mouse = function (coord) {
        if (!$.canvas) {
            return;
        }
        if (!$.dimensionUnit) {
            $.dimensionUnit = $.canvas.width / $.t5PixelDensity;
        }
        return (coord / $.canvas.width) * $.dimensionUnit;
    };
    $.createCanvas = function (w, h, renderer, options) {
        if (typeof renderer == 'object') options = renderer;
        p.canvas = $.createElement('canvas').element;
        $.canvas = p.canvas;
        p.canvas.width = (w || window.innerWidth) * $.t5PixelDensity;
        p.canvas.height = (h || window.innerHeight) * $.t5PixelDensity;
        p.canvas.style.width = `${w || window.innerWidth}px`;
        p.canvas.style.height = `${h || window.innerHeight}px`;
        $.width = w || window.innerWidth;
        $.height = h || window.innerHeight;
        p.context = p.canvas.getContext('2d');
        p.canvas.ctx = p.context;
        p.canvas.context = p.context;
        document.body.appendChild(p.canvas);
        $.renderer = renderer
        if (renderer != 'graphics') {
            window.drawingContext = p.context;
            window.width = $.width;
            window.height = $.height;
            window.canvasWidth = p.canvas.width;
            window.canvasHeight = p.canvas.height;
            window.canvas = p.canvas;
            window.context = p.context;
        }

        $.drawingContext = p.context
        $.ctx = $.context = p.context;

        $.ctx.fillStyle = 'rgb(255, 255, 255)';
        $.ctx.strokeStyle = 'rgb(0, 0, 0)';
        $.ctx.lineCap = 'round';
        $.ctx.lineJoin = 'miter';
        $.ctx.textAlign = 'left';

        $.ctx.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        $.ctx.save();

        if ($._globalSketch) {
            Object.defineProperty(window, 'width', {
                get: function () { return $.width; },
                configurable: true,
            });
            Object.defineProperty(window, 'height', {
                get: function () { return $.height; },
                configurable: true,
            });
        }

        $.ctx.scale($.t5PixelDensity, $.t5PixelDensity);

        return new T5Element(p.canvas);
    };

    $.resizeCanvas = function (w, h) {
        let prevProps = {
            fillStyle: $.context.fillStyle,
            strokeStyle: $.context.strokeStyle,
            lineWidth: $.context.lineWidth,
            lineCap: $.context.lineCap,
            lineJoin: $.context.lineJoin,
            textAlign: $.context.textAlign,
            font: $.context.font,
            globalAlpha: $.context.globalAlpha,
            globalCompositeOperation: $.context.globalCompositeOperation,
            filter: $.context.filter,
            imageSmoothingEnabled: $.context.imageSmoothingEnabled
        };

        p.canvas.width = w * $.t5PixelDensity;
        p.canvas.height = h * $.t5PixelDensity;
        p.canvas.style.width = `${w}px`;
        p.canvas.style.height = `${h}px`;
        $.width = w;
        $.height = h;
        if ($.renderer != 'graphics') {
            window.width = w;
            window.height = h;
        }

        window.canvasWidth = p.canvas.width;
        window.canvasHeight = p.canvas.height;
        if (window.isFlexCanvas && $.renderer != 'graphics') {
            window.width = $.dimensionUnit;
            window.height = ($.dimensionUnit / $.canvas.width) * $.canvas.height;
        }
        if ($.context) {
            $.context.scale($.t5PixelDensity, $.t5PixelDensity);

            // Restore previous properties
            $.context.fillStyle = prevProps.fillStyle;
            $.context.strokeStyle = prevProps.strokeStyle;
            $.context.lineWidth = prevProps.lineWidth;
            $.context.lineCap = prevProps.lineCap;
            $.context.lineJoin = prevProps.lineJoin;
            $.context.textAlign = prevProps.textAlign;
            $.context.font = prevProps.font;
            $.context.globalAlpha = prevProps.globalAlpha;
            $.context.globalCompositeOperation = prevProps.globalCompositeOperation;
            $.context.filter = prevProps.filter;
            $.context.imageSmoothingEnabled = prevProps.imageSmoothingEnabled;
        }

    };

    $.noCanvas = () => {
        if ($.canvas?.remove) $.canvas.remove();
        $.canvas = 0;
        p.context = p.drawingContext = 0;
    };

    $.resetMatrix = function () {
        if ($.context) {
            let prevProps = {
                fillStyle: $.context.fillStyle,
                strokeStyle: $.context.strokeStyle,
                lineWidth: $.context.lineWidth,
                lineCap: $.context.lineCap,
                lineJoin: $.context.lineJoin,
                textAlign: $.context.textAlign,
                font: $.context.font,
                globalAlpha: $.context.globalAlpha,
                globalCompositeOperation: $.context.globalCompositeOperation,
                filter: $.context.filter,
                imageSmoothingEnabled: $.context.imageSmoothingEnabled
            };
            $.context.resetTransform();
            $.context.scale($.t5PixelDensity, $.t5PixelDensity);

            $.context.fillStyle = prevProps.fillStyle;
            $.context.strokeStyle = prevProps.strokeStyle;
            $.context.lineWidth = prevProps.lineWidth;
            $.context.lineCap = prevProps.lineCap;
            $.context.lineJoin = prevProps.lineJoin;
            $.context.textAlign = prevProps.textAlign;
            $.context.font = prevProps.font;
            $.context.globalAlpha = prevProps.globalAlpha;
            $.context.globalCompositeOperation = prevProps.globalCompositeOperation;
            $.context.filter = prevProps.filter;
            $.context.imageSmoothingEnabled = prevProps.imageSmoothingEnabled;
        }
    };

    $.defineConstant('CORNER', 'corner');
    $.defineConstant('CENTER', 'center');
    $.defineConstant('CORNERS', 'corners');
    $.defineConstant('RADIUS', 'radius');

    $.currentRectMode = 'corner';

    $.rectMode = function (mode) {
        if (mode === 'corner' || mode === 'corners' || mode === 'center' || mode === 'radius') {
            $.currentRectMode = mode;
        } else {
            console.error("Invalid rectangle mode. Use 'corner', 'corners', 'center', or 'radius'.");
        }
    };

    $.currentEllipseMode = 'center';

    $.ellipseMode = function (mode) {
        if (mode === 'center' || mode === 'radius' || mode === 'corner' || mode === 'corners') {
            $.currentEllipseMode = mode;
        } else {
            console.error("Invalid ellipse mode. Use 'center', 'radius', 'corner', or 'corners'.");
        }
    };

    $.currentImageMode = 'corner';

    $.imageMode = function (mode) {
        if (mode === 'corner' || mode === 'corners' || mode === 'center') {
            $.currentImageMode = mode;
        } else {
            console.error("Invalid image mode. Use 'corner', 'corners', or 'center'.");
        }
    };

    $.defineConstant('DEGREES', 'degrees');
    $.defineConstant('RADIANS', 'radians');

    $.currentAngleMode = "radians";

    function radians(degrees) {
        return degrees * (Math.PI / 180);
    }

    function degrees(radians) {
        return radians * (180 / Math.PI);
    }

    $.angleMode = function (mode) {
        if (mode === "radians" || mode === "degrees") {
            $.currentAngleMode = mode;
        } else {
            console.error("Invalid angle mode. Use 'radians' or 'degrees'.");
        }
    };

    $.convertAngle = function (angle) {
        if ($.currentAngleMode === "degrees") {
            return radians(angle);
        }
        return angle;
    };

    $.translate = function (x, y) {
        if ($.context) {
            $.context.translate(x, y);
        }
    };

    $.rotate = function (angle) {
        if ($.context) {
            $.context.rotate($.convertAngle(angle));
        }
    };

    $.scale = function (x, y) {
        if ($.context) {
            $.context.scale(x, y);
        }
    };

    $.push = function () {
        if ($.context) {
            $.context.save();
        }
    };

    $.pop = function () {
        if ($.context) {
            $.context.restore();
        }
    };

    $.shearX = function (angle) {
        if ($.context) {
            $.context.transform(1, 0, Math.tan($.convertAngle(angle)), 1, 0, 0);
        }
    };

    $.shearY = function (angle) {
        if ($.context) {
            $.context.transform(1, Math.tan($.convertAngle(angle)), 0, 1, 0, 0);
        }
    };
    $.pixelDensity = function (density) {
        if (density === undefined) {
            return $.t5PixelDensity;
        } else {
            $.t5PixelDensity = density;
            if ($.canvas) {
                $.resizeCanvas($.width, $.height);
            }
        }
    };

    $.flexibleCanvas = function (dimensionUnit) {
        $.dimensionUnit = dimensionUnit
        window.isFlexCanvas = true;
        if ($.renderer != 'graphics') {
            window.width = $.dimensionUnit;
            window.height = ($.dimensionUnit / $.canvas.width) * $.canvas.height;
        }
    };

    $.get = function (x, y, w, h) {
        if (x === undefined) {
            return $.ctx.getImageData(0, 0, $.width, $.height);
        } else if (w === undefined) {
            return $.ctx.getImageData(x, y, 1, 1).data;
        } else {
            return $.ctx.getImageData(x, y, w, h);
        }
    };

    $.copy = function (src, sx, sy, sw, sh, dx, dy, dw, dh) {
        let source;
        sw = sw * $.t5PixelDensity
        sh = sh * $.t5PixelDensity
        if (src instanceof $.Graphics) {
            source = src.canvas;
        } else if (src instanceof T5Element) {
            source = src.element;
        } else if (src instanceof HTMLCanvasElement || src instanceof Image) {
            source = src;
        } else if (src && src.canvas instanceof HTMLCanvasElement) {
            source = src.canvas;
        } else {
            source = $.canvas;
        }

        if (source instanceof HTMLCanvasElement || source instanceof Image) {
            $.ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            console.error("Invalid source for copy function");
        }
    };

    $.remove = function () {
        if ($.canvas?.remove) {
            $.canvas.remove();
        }
    };

    $.loadPixels = function () {
        if (!$.pixels) {
            $.pixels = $.ctx.getImageData(0, 0, $.width, $.height);
        } else {
            const newPixels = $.ctx.getImageData(0, 0, $.width, $.height);
            $.pixels.data.set(newPixels.data);
        }
        $.pixelData = $.pixels.data;
        if ($._globalSketch) {
            window.pixels = $.pixelData;
        } else {
            p.pixels = $.pixelData;
        }
    };

    $.updatePixels = function (x, y, w, h) {
        if (x === undefined || y === undefined || w === undefined || h === undefined) {
            $.ctx.putImageData($.pixels, 0, 0);
        } else {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = $.pixels.width;
            tempCanvas.height = $.pixels.height;
            tempCtx.putImageData($.pixels, 0, 0);
            $.ctx.drawImage(tempCanvas, x, y, w, h, x, y, w, h);
        }
    };
    if ($._globalSketch) {
        window.loadPixels = $.loadPixels.bind($);
        window.updatePixels = $.updatePixels.bind($);
    }

    $.defineConstant('BLEND', 'source-over');
    $.defineConstant('REMOVE', 'destination-out');
    $.defineConstant('ADD', 'lighter');
    $.defineConstant('DARKEST', 'darken');
    $.defineConstant('LIGHTEST', 'lighten');
    $.defineConstant('DIFFERENCE', 'difference');
    $.defineConstant('SUBTRACT', 'subtract');
    $.defineConstant('EXCLUSION', 'exclusion');
    $.defineConstant('MULTIPLY', 'multiply');
    $.defineConstant('SCREEN', 'screen');
    $.defineConstant('REPLACE', 'copy');
    $.defineConstant('OVERLAY', 'overlay');
    $.defineConstant('HARD_LIGHT', 'hard-light');
    $.defineConstant('SOFT_LIGHT', 'soft-light');
    $.defineConstant('DODGE', 'color-dodge');
    $.defineConstant('BURN', 'color-burn');

    $.blendMode = function (mode) {
        if ($.context) {
            $.context.globalCompositeOperation = mode;
        }
    };

    $.defineConstant('THRESHOLD', 'THRESHOLD');
    $.defineConstant('GRAY', 'GRAY');
    $.defineConstant('OPAQUE', 'OPAQUE');
    $.defineConstant('INVERT', 'INVERT');
    $.defineConstant('POSTERIZE', 'POSTERIZE');
    $.defineConstant('DILATE', 'DILATE');
    $.defineConstant('ERODE', 'ERODE');
    $.defineConstant('BLUR', 'BLUR');

    $.filter = function (mode, value) {
        if (!$.context) return;

        const tmpCanvas = document.createElement('canvas');
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = $.canvas.width;
        tmpCanvas.height = $.canvas.height;

        tmpCtx.drawImage($.canvas, 0, 0);

        const imageData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
        const data = imageData.data;

        switch (mode) {
            case GRAY:
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.155 * data[i] + 0.597 * data[i + 1] + 0.319 * data[i + 2];
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;

            case INVERT:
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;

            case POSTERIZE:
                if (value < 2 || value > 255) {
                    throw new Error('Posterize value must be between 2 and 255');
                }
                let lvl = value;
                let lvl1 = lvl - 1;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = (((data[i] * lvl) >> 8) * 255) / lvl1;
                    data[i + 1] = (((data[i + 1] * lvl) >> 8) * 255) / lvl1;
                    data[i + 2] = (((data[i + 2] * lvl) >> 8) * 255) / lvl1;
                }
                tmpCtx.putImageData(imageData, 0, 0);
                $.ctx.drawImage(tmpCanvas, 0, 0);
                break;

            case THRESHOLD:
                const threshold = value !== undefined ? value * 255 : 128;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const val = avg >= threshold ? 255 : 0;
                    data[i] = val;
                    data[i + 1] = val;
                    data[i + 2] = val;
                }
                break;

            case OPAQUE:
                for (let i = 0; i < data.length; i += 4) {
                    data[i + 3] = 255;
                }
                break;

            case BLUR:
            case DILATE:
            case ERODE:
                $.context.filter = mode.toLowerCase() + (value ? `(${value}px)` : '');
                $.context.drawImage(tmpCanvas, 0, 0);
                $.context.filter = 'none';
                return;

            default:
                throw new Error('Unsupported filter mode: ' + mode);
        }

        tmpCtx.putImageData(imageData, 0, 0);
        $.context.drawImage(tmpCanvas, 0, 0);
    };

    $.defineConstant('LABEL', 'LABEL');
    $.defineConstant('FALLBACK', 'FALLBACK');

    $.describe = function (text, display) {
        const canvas = $.canvas || p.canvas;
        if (!canvas) return;

        const existingDescription = document.getElementById('t5-canvas-description');
        if (existingDescription) {
            existingDescription.remove();
        }

        const description = document.createElement('div');
        description.id = 't5-canvas-description';
        description.innerText = text;
        description.style.position = 'absolute';
        description.style.clip = 'rect(1px, 1px, 1px, 1px)';
        description.style.height = '1px';
        description.style.margin = '-1px';
        description.style.overflow = 'hidden';
        description.style.padding = '0';
        description.style.width = '1px';
        description.style.border = '0';

        if (display === 'LABEL') {
            description.style.position = 'relative';
            description.style.clip = 'auto';
            description.style.height = 'auto';
            description.style.margin = '10px 0';
            description.style.overflow = 'visible';
            description.style.padding = '0';
            description.style.width = 'auto';
            description.style.border = '0';
        }

        canvas.setAttribute('aria-label', text);
        canvas.parentNode.insertBefore(description, canvas.nextSibling);
    };

    $.saveCanvas = function (filename = 'untitled', extension = 'png') {
        if (!$.canvas) {
            console.error('No canvas found to save.');
            return;
        }

        const filenameParts = filename.split('.');
        if (filenameParts.length > 1) {
            extension = filenameParts.pop();
            filename = filenameParts.join('.');
        }

        const validExtensions = ['png', 'jpg'];
        if (!validExtensions.includes(extension)) {
            console.error(`Invalid extension: ${extension}. Valid extensions are 'png' and 'jpg'.`);
            return;
        }

        const mimeType = extension === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataURL = $.canvas.toDataURL(mimeType);

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${filename}.${extension}`;
        link.click();
    };
};
// Integrate the canvas add-on
T5.addOns.canvas(T5.prototype, T5.prototype);
//************************************************************************//
//******************************-T5Graphics-******************************//
//************************************************************************//
T5.addOns.createGraphics = ($, p) => {
    class Graphics extends T5 {
        constructor(w, h, parent) {
            super('local', parent);
        }
    }

    $.createGraphics = function (w, h) {
        let p = new Graphics(w, h, $);
        p.createCanvas(w, h, 'graphics')
        p.canvas.style.display = 'none'
        p.pixelDensity($.t5PixelDensity)
        p.flexibleCanvas(w)

        return p;
    };

    $.Graphics = Graphics;
};

T5.addOns.createGraphics(T5.prototype, T5.prototype);
//************************************************************************//
//******************************-T5Colors-********************************//
//************************************************************************//
T5.addOns.colors = ($, p) => {
    class ColorRGBA {
        constructor(r, g, b, a = 255) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        setRed(v) { this.r = v; }
        setGreen(v) { this.g = v; }
        setBlue(v) { this.b = v; }
        setAlpha(v) { this.a = v; }

        get levels() {
            return [this.r, this.g, this.b, this.a];
        }

        toString() {
            if (this.a === 255) {
                return `rgb(${this.r}, ${this.g}, ${this.b})`;
            } else {
                return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
            }
        }
    }

    function parseColorString(colorStr) {
        let r, g, b, a = 255;
        if (colorStr.startsWith('#')) {
            const hex = colorStr.slice(1);
            if (hex.length === 8) {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
                a = parseInt(hex.slice(6, 8), 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
            } else if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            }
            return new ColorRGBA(r, g, b, a);
        } else if (colorStr.startsWith('rgba')) {
            const values = colorStr.match(/\d+(\.\d+)?/g).map(Number);
            r = values[0];
            g = values[1];
            b = values[2];
            a = values[3] * 255;
            return new ColorRGBA(r, g, b, a);
        } else if (colorStr.startsWith('rgb')) {
            const values = colorStr.match(/\d+(\.\d+)?/g).map(Number);
            r = values[0];
            g = values[1];
            b = values[2];
            return new ColorRGBA(r, g, b, a);
        } else if (colorStr.startsWith('hsla')) {
            const values = colorStr.match(/\d+(\.\d+)?/g).map(Number);
            const h = values[0] / 360;
            const s = values[1] / 100;
            const l = values[2] / 100;
            a = values[3] * 255;
            const [r, g, b] = hslToRgb(h, s, l);
            return new ColorRGBA(r, g, b, a);
        } else if (colorStr.startsWith('hsl')) {
            const values = colorStr.match(/\d+(\.\d+)?/g).map(Number);
            const h = values[0] / 360;
            const s = values[1] / 100;
            const l = values[2] / 100;
            const [r, g, b] = hslToRgb(h, s, l);
            return new ColorRGBA(r, g, b, a);
        } else {
            const tempElem = document.createElement('div');
            tempElem.style.color = colorStr;
            document.body.appendChild(tempElem);
            const rgb = window.getComputedStyle(tempElem).color.match(/\d+/g).map(Number);
            document.body.removeChild(tempElem);
            return new ColorRGBA(rgb[0], rgb[1], rgb[2], a);
        }
    }

    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s == 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function hsbToRgb(h, s, b) {
        h = h / 360;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = b * (1 - s);
        const q = b * (1 - f * s);
        const t = b * (1 - (1 - f) * s);
        let r, g, blue;
        switch (i % 6) {
            case 0: r = b; g = t; blue = p; break;
            case 1: r = q; g = b; blue = p; break;
            case 2: r = p; g = b; blue = t; break;
            case 3: r = p; g = q; blue = b; break;
            case 4: r = t; g = p; blue = b; break;
            case 5: r = b; g = p; blue = q; break;
        }
        return [r * 255, g * 255, blue * 255];
    }

    // Initial color mode and ranges
    let colorMode = 'RGB';
    let maxR = 255, maxG = 255, maxB = 255, maxA = 255;

    $.defineConstant('RGB', 'RGB');
    $.defineConstant('HSB', 'HSB');
    $.defineConstant('HSL', 'HSL');

    $.colorMode = function (mode, max1 = 255, max2 = 255, max3 = 255, maxA_ = 255) {
        colorMode = mode;
        maxR = max1;
        maxG = max2;
        maxB = max3;
        maxA = maxA_;
    };

    $.color = function (...args) {
        if (args.length === 1 && typeof args[0] === 'string') {
            return parseColorString(args[0]);
        }

        if (colorMode === 'RGB') {
            if (args.length === 1 && typeof args[0] === 'number') {
                const c = (args[0] / maxR) * 255;
                return new ColorRGBA(c, c, c);
            } else if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
                const c = (args[0] / maxR) * 255;
                const a = (args[1] / maxA) * 255;
                return new ColorRGBA(c, c, c, a);
            } else if (args.length >= 3) {
                const r = (args[0] / maxR) * 255;
                const g = (args[1] / maxG) * 255;
                const b = (args[2] / maxB) * 255;
                const a = args[3] !== undefined ? (args[3] / maxA) * 255 : 255;
                return new ColorRGBA(r, g, b, a);
            }
        } else if (colorMode === 'HSB') {
            if (args.length === 1 && typeof args[0] === 'number') {
                const b = (args[0] / maxB) * 255;
                return new ColorRGBA(b, b, b);
            } else if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
                const b = (args[0] / maxB) * 255;
                const a = (args[1] / maxA) * 255;
                return new ColorRGBA(b, b, b, a);
            } else if (args.length >= 3) {
                const h = (args[0] / maxR) * 360;
                const s = (args[1] / maxG);
                const b = (args[2] / maxB);
                const a = args[3] !== undefined ? (args[3] / maxA) * 255 : 255;
                const [r, g, blue] = hsbToRgb(h, s, b);
                return new ColorRGBA(r, g, blue, a);
            }
        } else if (colorMode === 'HSL') {
            if (args.length === 1 && typeof args[0] === 'number') {
                const l = (args[0] / maxB) * 255;
                return new ColorRGBA(l, l, l);
            } else if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
                const l = (args[0] / maxB) * 255;
                const a = (args[1] / maxA) * 255;
                return new ColorRGBA(l, l, l, a);
            } else if (args.length >= 3) {
                const h = (args[0] / maxR);
                const s = (args[1] / maxG);
                const l = (args[2] / maxB);
                const a = args[3] !== undefined ? (args[3] / maxA) * 255 : 255;
                const [r, g, blue] = hslToRgb(h, s, l);
                return new ColorRGBA(r, g, blue, a);
            }
        }
        return null;
    };

    $.isColorObject = function (obj) {
        return obj instanceof ColorRGBA;
    };

    $.handleColorArgument = function handleColorArgument(args) {
        let colorObj;
        if (args.length === 1 && $.isColorObject(args[0])) {
            colorObj = args[0];
        } else if (args.length === 1 && Array.isArray(args[0])) {
            colorObj = $.color(...args[0]);
        } else if (args.length === 1 && typeof args[0] === 'number') {
            colorObj = $.color(args[0]);
        } else {
            colorObj = $.color(...args);
        }
        return colorObj;
    }

    function updateAlphaFlags(colorObj, type) {
        if (type === 'fill') {
            $.noAlphaFill = (colorObj.a === 0);
        } else if (type === 'stroke') {
            $.noAlphaStroke = (colorObj.a === 0);
        }
    }

    $.fill = function (...args) {
        const colorObj = handleColorArgument(args);
        if (colorObj) {
            const colorString = colorObj.toString();
            $.context.fillStyle = colorString;
            $.textFillColor = colorString;
            updateAlphaFlags(colorObj, 'fill');
        }
    };

    $.stroke = function (...args) {
        const colorObj = handleColorArgument(args);
        if (colorObj) {
            const colorString = colorObj.toString();
            $.context.strokeStyle = colorString;
            $.textStrokeColor = colorString;
            updateAlphaFlags(colorObj, 'stroke');
        }
    };

    $.background = function (...args) {
        const colorObj = handleColorArgument(args);
        if (colorObj) {
            const colorString = colorObj.toString();
            $.context.save();
            $.context.fillStyle = colorString;
            $.context.fillRect(0, 0, $.canvas.width, $.canvas.height);
            $.context.restore();
        }
    };

    $.noFill = function () {
        $.context.fillStyle = 'rgba(0,0,0,0)';
        $.textFillColor = 'rgba(0,0,0,0)';
        $.noAlphaFill = true;
    };

    $.noStroke = function () {
        $.context.strokeStyle = 'rgba(0,0,0,0)';
        $.textStrokeColor = 'rgba(0,0,0,0)';
        $.noAlphaStroke = true;
    };

    $.smooth = function () {
        $.context.imageSmoothingEnabled = true;
    };
    $.noSmooth = function () {
        $.context.imageSmoothingEnabled = false;
    };
    $.noAntialiasing = function () {
        $.context.filter = "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImZpbHRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jUiB0eXBlPSJpZGVudGl0eSIvPjxmZUZ1bmNHIHR5cGU9ImlkZW50aXR5Ii8+PGZlRnVuY0IgdHlwZT0iaWRlbnRpdHkiLz48ZmVGdW5jQSB0eXBlPSJkaXNjcmV0ZSIgdGFibGVWYWx1ZXM9IjAgMSIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L3N2Zz4=#filter)";
    };
    $.antialiasing = function () {
        $.context.filter = "none";
    };
    $.currentTint = null;
    $.tint = function (...args) {
        const colorObj = handleColorArgument(args);
        if (colorObj) {
            $.currentTint = colorObj.toString();
        }
    };

    $.noTint = function () {
        $.currentTint = null;
    };

    $.red = function (col) {
        const colorObj = $.isColorObject(col) ? col : $.color(col);
        return colorObj.r;
    };

    $.green = function (col) {
        const colorObj = $.isColorObject(col) ? col : $.color(col);
        return colorObj.g;
    };

    $.blue = function (col) {
        const colorObj = $.isColorObject(col) ? col : $.color(col);
        return colorObj.b;
    };

    $.alpha = function (col) {
        const colorObj = $.isColorObject(col) ? col : $.color(col);
        return colorObj.a;
    };

    $.lerpColor = function (c1, c2, amt) {
        // Ensure amt is clamped between 0 and 1
        amt = Math.max(0, Math.min(1, amt));

        // Parse the colors
        const color1 = $.isColorObject(c1) ? c1 : $.color(c1);
        const color2 = $.isColorObject(c2) ? c2 : $.color(c2);

        // Calculate the interpolated color components
        const r = Math.round($.lerp(color1.r, color2.r, amt));
        const g = Math.round($.lerp(color1.g, color2.g, amt));
        const b = Math.round($.lerp(color1.b, color2.b, amt));
        const a = Math.round($.lerp(color1.a, color2.a, amt));

        // Return the new color
        return new ColorRGBA(r, g, b, a);
    };

    // Linear interpolation function
    $.lerp = function (start, stop, amt) {
        return start + (stop - start) * amt;
    };

    $.erase = function (fillAlpha = 255, strokeAlpha = 255) {
        $.context.save();
        $.context.globalCompositeOperation = 'destination-out';
        $.context.fillStyle = `rgba(0, 0, 0, ${fillAlpha / 255})`;
        $.context.strokeStyle = `rgba(0, 0, 0, ${strokeAlpha / 255})`;
    };

    $.noErase = function () {
        $.context.globalCompositeOperation = 'source-over';
        $.context.restore();
    };
};

T5.addOns.colors(T5.prototype, T5.prototype);

//************************************************************************//
//********************************-T5Image-*******************************//
//************************************************************************//
T5.addOns.image = ($, p) => {
    class T5Image {
        constructor(img) {
            this.img = img;
            this.width = 0; // Initialize width as 0
            this.height = 0; // Initialize height as 0
        }

        // Method to update dimensions after load
        setDimensions(width, height) {
            this.width = width;
            this.height = height;
        }
    }


    $.loadImage = function (path, callback) {
        window.t5PreloadCount++;
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            window.t5PreloadDone++;

            // Create the T5Image instance after the image has fully loaded
            const t5Img = new T5Image(img);
            t5Img.setDimensions(img.width, img.height); // Set dimensions here

            if (callback) {
                callback(t5Img); // Call the callback with the fully loaded image
            }
        };

        img.onerror = (err) => {
            window.t5PreloadDone++;
            console.error(`Failed to load image at path: ${path}. Please check your image path.`);
        };

        img.src = path; // Set the source to start loading the image
        return img;
    };

    $.createImage = function (width, height, bgColor = null) {
        // Create a new canvas element with the given dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Get the 2D context for drawing
        const context = canvas.getContext('2d');

        // If a background color is provided, fill the canvas with that color
        if (bgColor) {
            $.fill(bgColor)
            context.fillRect(0, 0, width, height);
        }

        // Create a new T5Image instance using the canvas as the image source
        const newImage = new T5Image(canvas);
        newImage.drawingContext = context
        // Set the dimensions of the T5Image instance
        newImage.setDimensions(width, height);

        return newImage; // Return the created image
    };

    let tmpCanvas = null;
    function createTempCanvas(width, height) {
        if (tmpCanvas != null) {
            return tmpCanvas.tmpCtx
        } else {
            tmpCanvas = document.createElement('canvas');
            tmpCanvas.tmpCtx = tmpCanvas.getContext('2d');
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            return tmpCanvas.tmpCtx
        }
    }

    function extractRGBFromColorString(colorString) {
        const rgbaMatch = colorString.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        return rgbaMatch ? `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})` : colorString;
    }

    function extractAlphaFromColorString(colorString) {
        const rgbaMatch = colorString.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        return rgbaMatch ? parseFloat(rgbaMatch[4]) : 1;
    }

    $.image = function (img, x, y, w, h, sx = 0, sy = 0, sw, sh) {
        if (!img) return;
        let source;
        if (img instanceof T5Image) {
            source = img.img;
        } else if (img instanceof $.Graphics) {
            source = img.canvas;
        } else if (img instanceof Image) {
            source = img;
        } else if (img.img) {
            source = img.img;
        } else {
            throw new Error("Invalid image object. Ensure you're using 'loadImage(path)' to load images.");
        }
        let offset = (0.0);

        w = w ? (w) : (source.width) + offset;
        h = h ? (h) : (source.height) + offset;

        sw = sw !== undefined ? sw : source.width;
        sh = sh !== undefined ? sh : source.height;

        switch ($.currentImageMode) {
            case 'corner':
                break;
            case 'corners':
                w = w - x;
                h = h - y;
                break;
            case 'center':
                x = x - w / 2;
                y = y - h / 2;
                break;
        }

        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);

        if ($.currentTint) {
            const tempCanvas = createTempCanvas(w, h);

            tempCanvas.clearRect(0, 0, w, h);
            tempCanvas.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

            const tintRGB = extractRGBFromColorString($.currentTint);
            const tintAlpha = extractAlphaFromColorString($.currentTint);

            tempCanvas.globalCompositeOperation = 'multiply';
            tempCanvas.fillStyle = tintRGB;
            tempCanvas.fillRect(0, 0, w, h);

            $.context.save();
            $.context.globalAlpha = tintAlpha;
            $.context.drawImage(tempCanvas.canvas, x, y, w, h);
            $.context.globalAlpha = 1; // Reset alpha to default
            $.context.restore();
        } else {
            $.context.drawImage(source, sx, sy, sw, sh, x, y, w, h);
            // $.context.drawImage(source, x, y, w, h);
        }
        return img;
    };

};

T5.addOns.image(T5.prototype, T5.prototype);

//************************************************************************//
//*******************************-T5Strings-******************************//
//************************************************************************//
T5.addOns.strings = ($, p) => {
    class T5Strings {
        constructor(lines) {
            this.lines = lines;
        }
    }

    $.loadStrings = function (path, callback) {
        window.t5PreloadCount++;
        const t5Strings = [];

        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load strings from path: ${path}. Please check your file path.`);
                }
                return response.text();
            })
            .then(text => {
                const lines = text.split(/\r?\n/);
                lines.forEach(line => t5Strings.push(line));
                window.t5PreloadDone++;
                if (callback) {
                    callback(t5Strings);
                }
            })
            .catch(error => {
                window.t5PreloadDone++;
                console.error(error.message);
            });

        return t5Strings;
    };
};

T5.addOns.strings(T5.prototype, T5.prototype);

//************************************************************************//
//********************************-T5Draw-********************************//
//************************************************************************//
T5.addOns.draw = ($, p) => {
    $.defineConstant('CLOSE', true);
    $.defineConstant('OPEN', false);
    $.defineConstant('ROUND', 'round');
    $.defineConstant('SQUARE', 'butt');
    $.defineConstant('PROJECT', 'square');
    $.defineConstant('MITER', 'miter');
    $.defineConstant('BEVEL', 'bevel');

    $.defineConstant('RADIUS', 'radius');
    $.defineConstant('CORNER', 'corner');
    $.defineConstant('CORNERS', 'corners');

    $.rect = function (x, y, w, h = w) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentRectMode) {
                case 'corner':
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    break;
                case 'center':
                    x = x - w / 2;
                    y = y - h / 2;
                    break;
                case 'radius':
                    x = x - w;
                    y = y - h;
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x, y);
                $.vertex(x + w, y);
                $.vertex(x + w, y + h);
                $.vertex(x, y + h);
                $.endShape(CLOSE);
            } else {
                [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
                if ($.noAlphaStroke && !$.noAlphaFill) {
                    $.context.fillRect(x, y, w, h);
                } else {
                    $.context.beginPath();
                    $.context.rect(x, y, w, h);
                    if (!$.noAlphaFill) {
                        $.context.fill();
                    }
                    if (!$.noAlphaStroke) {
                        $.context.stroke();
                    }
                }
            }
        }
    };

    $.square = function (x, y, w, h = w) {
        $.rect(x, y, w, h);
    };

    $.fillRect = function (x, y, w, h = w) {
        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
        if ($.context) {
            $.context.fillRect(x, y, w, h);
        }
    };

    $.ellipse = function (x, y, w, h = w) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentEllipseMode) {
                case 'corner':
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'center':
                    break;
                case 'radius':
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
            if ($.noAlphaStroke && !$.noAlphaFill) {
                $.fillEllipse(x, y, w, h);
            } else {
                $.context.beginPath();
                $.context.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    $.circle = function (x, y, d) {
        $.ellipse(x, y, d, d);
    };

    $.fillEllipse = function (x, y, w, h = w) {
        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
        if ($.context) {
            $.context.beginPath();
            $.context.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
            $.context.fill();
        }
    };

    $.defineConstant('CHORD', 'chord');
    $.defineConstant('PIE', 'pie');

    $.arc = function (x, y, w, h, start, stop, mode = 'open', counterclockwise = false) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentEllipseMode) {
                case 'corner':
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'center':
                    break;
                case 'radius':
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
            start = $.convertAngle(start);
            stop = $.convertAngle(stop);

            $.context.beginPath();
            $.context.ellipse(x, y, w / 2, h / 2, 0, start, stop, counterclockwise);

            if (mode === 'chord') {
                $.context.lineTo(x + (w / 2) * Math.cos(start), y + (h / 2) * Math.sin(start));
            } else if (mode === 'pie') {
                $.context.lineTo(x, y);
                $.context.closePath();
            }

            if (!$.noAlphaFill) {
                $.context.fill();
            }
            if (!$.noAlphaStroke) {
                $.context.stroke();
            }
        }
    };

    $.line = function (x1, y1, x2, y2) {
        if ($.context) {
            if ($.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2] = $.scaleT5Coords([x1, y1, x2, y2]);
            $.context.beginPath();
            $.context.moveTo(x1, y1);
            $.context.lineTo(x2, y2);
            $.context.stroke();
        }
    };

    $.strokeWeight = function (weight) {
        weight = $.scaleT5Coord(weight);
        if (weight == 0) {
            $.context.strokeStyle = 'rgba(0,0,0,0)';
        }
        if ($.context) $.context.lineWidth = weight;
    };

    $.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x1, y1);
                $.vertex(x2, y2);
                $.vertex(x3, y3);
                $.vertex(x4, y4);
                $.endShape(CLOSE);
            } else {
                [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
                $.context.beginPath();
                $.context.moveTo(x1, y1);
                $.context.lineTo(x2, y2);
                $.context.lineTo(x3, y3);
                $.context.lineTo(x4, y4);
                $.context.closePath();
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    $.triangle = function (x1, y1, x2, y2, x3, y3) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x1, y1);
                $.vertex(x2, y2);
                $.vertex(x3, y3);
                $.endShape(CLOSE);
            } else {
                [x1, y1, x2, y2, x3, y3] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3]);
                $.context.beginPath();
                $.context.moveTo(x1, y1);
                $.context.lineTo(x2, y2);
                $.context.lineTo(x3, y3);
                $.context.closePath();
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    let currentShapeVertices = [];
    let currentShapeMode = '';
    let innerShapeVertices = [];
    $.innerBorderRadii = [];

    $.beginShape = function (mode = 'LINES') {
        currentShapeVertices = [];
        innerShapeVertices = [];
        currentShapeMode = mode;
    };

    $.beginContour = function () {
        console.warn('beginContour() is depreciated, use innerVertex(x, y) instead.')
    };

    $.vertex = function (x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        currentShapeVertices.push({ x, y, type: 'vertex' });
    };

    $.innerVertex = function (x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        innerShapeVertices.push({ x, y, type: 'vertex' });
    };

    $.bezierVertex = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        [cp1x, cp1y, cp2x, cp2y, x, y] = $.scaleT5Coords([cp1x, cp1y, cp2x, cp2y, x, y]);
        currentShapeVertices.push({ cp1x, cp1y, cp2x, cp2y, x, y, type: 'bezier' });
    };

    $.curveVertex = function (x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        currentShapeVertices.push({ x, y, type: 'curve' });
    };

    $.borderRadii = [];

    $.borderRadius = function (...radii) {
        if (radii == null || radii == undefined || radii == 'none') {
            $.borderRadii = [];
        } else {
            if (Array.isArray(radii[0])) {
                $.borderRadii = radii[0];
            } else {
                $.borderRadii = radii;
            }
        }
    };

    $.innerBorderRadius = function (...radii) {
        if (radii == null || radii == undefined || radii == 'none') {
            $.innerBorderRadii = [];
        } else {
            if (Array.isArray(radii[0])) {
                $.innerBorderRadii = radii[0];
            } else {
                $.innerBorderRadii = radii;
            }
        }
    };

    $.noBorderRadius = function () {
        $.borderRadii = [];
        $.innerBorderRadii = [];
    };

    $.endShape = function (CLOSE) {
        if ($.context && currentShapeVertices.length > 0) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            $.context.beginPath();

            if ($.borderRadii.length > 0) {
                _drawPathWithBorderRadius($.context, currentShapeVertices, $.borderRadii, CLOSE);
            } else {
                drawVertices($.context, currentShapeVertices, CLOSE);
            }

            if (innerShapeVertices.length > 0) {
                $.context.moveTo(innerShapeVertices[0].x, innerShapeVertices[0].y);
                if ($.innerBorderRadii.length > 0) {
                    _drawPathWithBorderRadius($.context, innerShapeVertices, $.innerBorderRadii, CLOSE);
                } else {
                    drawVertices($.context, innerShapeVertices, CLOSE);
                }
            }

            if (!$.noAlphaFill) {
                $.context.fill('evenodd');
            }
            if (!$.noAlphaStroke) {
                $.context.stroke();
            }

            currentShapeVertices = [];
            innerShapeVertices = [];
            currentShapeMode = '';
        }
    };

    function drawVertices(ctx, vertices, close) {
        if (vertices.length === 0) return;

        if (vertices[0].type === 'curve') {
            let verts = [...vertices];
            verts.unshift(verts[0]);
            verts.push(verts[verts.length - 1]);
            ctx.moveTo(verts[1].x, verts[1].y);

            for (let i = 1; i < verts.length - 2; i++) {
                let p0 = verts[i - 1];
                let p1 = verts[i];
                let p2 = verts[i + 1];
                let p3 = verts[i + 2];

                for (let t = 0; t <= 1; t += 0.1) {
                    let x = 0.5 * ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
                        (-p0.x + p2.x) * t +
                        2 * p1.x);

                    let y = 0.5 * ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
                        (-p0.y + p2.y) * t +
                        2 * p1.y);

                    ctx.lineTo(x, y);
                }
            }
            ctx.lineTo(verts[verts.length - 2].x, verts[verts.length - 2].y);

        } else {
            let startVertex = vertices[0];
            ctx.moveTo(startVertex.x, startVertex.y);

            for (let i = 1; i < vertices.length; i++) {
                let currentVertex = vertices[i];
                if (currentVertex.type === 'vertex') {
                    ctx.lineTo(currentVertex.x, currentVertex.y);
                } else if (currentVertex.type === 'bezier') {
                    ctx.bezierCurveTo(
                        currentVertex.cp1x,
                        currentVertex.cp1y,
                        currentVertex.cp2x,
                        currentVertex.cp2y,
                        currentVertex.x,
                        currentVertex.y
                    );
                } else if (currentVertex.type === 'curve') {
                    let p0 = vertices[i - 1];
                    let p1 = currentVertex;
                    let p2 = vertices[i + 1] || currentVertex;
                    let p3 = vertices[i + 2] || p2;

                    for (let t = 0; t <= 1; t += 0.1) {
                        let x = 0.5 * ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t +
                            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
                            (-p0.x + p2.x) * t +
                            2 * p1.x);

                        let y = 0.5 * ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t +
                            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
                            (-p0.y + p2.y) * t +
                            2 * p1.y);

                        ctx.lineTo(x, y);
                    }
                }
            }

            if (close) {
                ctx.closePath();
            }
        }
    }

    function _drawPathWithBorderRadius(ctx, vertices, radii, close) {
        if (vertices.length < 2) return;

        const firstVertex = vertices[0];
        const lastVertex = vertices[vertices.length - 1];

        if (close && radii.length > 0) {
            const radius = _getBorderRadius(radii, 0);
            const prevLine = _calculateLine(lastVertex, firstVertex, radius);
            ctx.moveTo(prevLine.x1, prevLine.y1);
        } else {
            ctx.moveTo(firstVertex.x, firstVertex.y);
        }

        for (let i = 0, len = vertices.length; i < len; i++) {
            const currVertex = vertices[i];
            const nextVertex = vertices[(i + 1) % len];
            const prevVertex = vertices[(i - 1 + len) % len];

            const radius = _getBorderRadius(radii, i);
            if (radius > 0) {
                const prevLine = _calculateLine(prevVertex, currVertex, radius);
                const nextLine = _calculateLine(currVertex, nextVertex, radius);

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

    function _calculateLine(p0, p1, radius) {
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

    function _getBorderRadius(radii, index) {
        if (radii.length === 0) return 0;
        let radius = radii[Math.min(index, radii.length - 1)];
        [radius] = $.scaleT5Coords([radius]);
        return radius;
    }

    $.point = function (x, y) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x, y] = $.scaleT5Coords([x, y]);
            $.context.save();
            $.context.beginPath();
            $.context.arc(x, y, $.context.lineWidth / 2, 0, Math.PI * 2);
            $.context.fillStyle = $.context.strokeStyle;
            $.context.fill();
            $.context.restore();
        }
    };

    $.fillText = function (text, x, y) {
        if ($.context) {
            [text, x, y] = $.scaleT5Coords([text, x, y]);
            $.context.fillText(text, x, y);
        }
    };

    $.clear = function () {
        if ($.context) {
            $.context.clearRect(0, 0, $.canvas.width, $.canvas.height);
        }
    };

    $.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            $.context.beginPath();
            $.context.moveTo(x1, y1);
            $.context.bezierCurveTo(x2, y2, x3, y3, x4, y4);
            $.context.stroke();
        }
    };

    $.bezierCurve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            let cp1x = x2 + (x3 - x1) / 6;
            let cp1y = y2 + (y3 - y1) / 6;
            let cp2x = x3 - (x4 - x2) / 6;
            let cp2y = y3 - (y4 - y2) / 6;

            $.context.beginPath();
            $.context.moveTo(x2, y2);
            $.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
            $.context.stroke();
        }
    };

    $.curve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            let cp1x = x2 + (x3 - x1) / 6;
            let cp1y = y2 + (y3 - y1) / 6;
            let cp2x = x3 - (x4 - x2) / 6;
            let cp2y = y3 - (y4 - y2) / 6;

            $.context.beginPath();
            $.context.moveTo(x2, y2);
            $.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
            $.context.stroke();
        }
    };
};

T5.addOns.draw(T5.prototype, T5.prototype);

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
    $.norm = (value, start, stop) => (value - start) / (stop - start);
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
//************************************************************************//
//********************************-T5Text-********************************//
//************************************************************************//
T5.addOns.text = ($, p) => {
    $.defineConstant('NORMAL', 'normal');
    $.defineConstant('ITALIC', 'italic');
    $.defineConstant('BOLD', 'bold');
    $.defineConstant('BOLDITALIC', 'italic bold');
    $.defineConstant('CENTER', 'center');
    $.defineConstant('MIDDLE', 'middle');
    $.defineConstant('LEFT', 'left');
    $.defineConstant('RIGHT', 'right');
    $.defineConstant('TOP', 'top');
    $.defineConstant('BOTTOM', 'bottom');
    $.defineConstant('BASELINE', 'alphabetic');
    $.defineConstant('WORD', 'word');
    $.defineConstant('CHAR', 'char');
    $.defineConstant('WRAP', 'wrap');
    $.defineConstant('NOWRAP', 'nowrap');

    $.textSizeVal = 12;
    $.textAlignH = 'left';
    $.textAlignV = 'alphabetic';
    $.textLeadingVal = $.textSizeVal * 1.2;
    $.textFontVal = 'sans-serif';
    $.textStyleVal = 'normal';
    $.textWrapVal = 'wrap';
    $.textFillColor = '#000000';
    $.textStrokeColor = '#000000';

    $.textSize = function (size) {
        [size] = $.scaleT5Coords([size]);
        if (size !== undefined) {
            $.textSizeVal = size;
            $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        }
        return $.textSizeVal;
    };

    $.textFont = function (font) {
        if (font instanceof T5Font) {
            font = font.family;
        }
        if (font !== undefined) {
            $.textFontVal = font;
            $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        }
        return $.textFontVal;
    };

    $.textStyle = function (style) {
        if (style !== undefined) {
            $.textStyleVal = style;
            $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        }
        return $.textStyleVal;
    };

    $.textAlign = function (hAlign, vAlign) {
        if (hAlign !== undefined) {
            $.textAlignH = hAlign;
        }
        if (vAlign !== undefined) {
            $.textAlignV = vAlign;
        }
        $.context.textAlign = $.textAlignH;
        $.context.textBaseline = $.textAlignV;
    };

    $.textLeading = function (leading) {
        [leading] = $.scaleT5Coords([leading]);
        if (leading !== undefined) {
            $.textLeadingVal = leading;
        }
        return $.textLeadingVal;
    };

    $.textWrap = function (wrapType) {
        if (wrapType !== undefined) {
            $.textWrapVal = wrapType;
        }
        return $.textWrapVal;
    };

    $.textWidth = function (str) {
        return $.context.measureText(str).width;
    };

    $.textAscent = function () {
        $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        return $.context.measureText("M").actualBoundingBoxAscent;
    };

    $.textDescent = function () {
        $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
        return $.context.measureText("g").actualBoundingBoxDescent;
    };

    $.text = function (str, x, y, maxWidth) {
        [x, y] = $.scaleT5Coords([x, y]);
        const lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if ($.textWrapVal === 'wrap' && maxWidth !== undefined) {
                $.drawWrappedText(lines[i], x, y + i * $.textLeadingVal, maxWidth);
            } else {
                if ($.context.strokeStyle && !$.noAlphaStroke) {
                    $.context.strokeText(lines[i], x, y + i * $.textLeadingVal);
                }
                if ($.context.fillStyle && !$.noAlphaFill) {
                    $.context.fillText(lines[i], x, y + i * $.textLeadingVal);
                }
            }
        }
    };

    $.drawWrappedText = function (text, x, y, maxWidth) {
        let words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let metrics = $.context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && i > 0) {
                if ($.context.strokeStyle && !$.noAlphaStroke) {
                    $.context.strokeText(line, x, y);
                }
                if ($.context.fillStyle && !$.noAlphaFill) {
                    $.context.fillText(line, x, y);
                }
                line = words[i] + ' ';
                y += $.textLeadingVal;
            } else {
                line = testLine;
            }
        }
        if ($.context.strokeStyle) {
            $.context.strokeText(line, x, y);
        }
        if ($.context.fillStyle) {
            $.context.fillText(line, x, y);
        }
    };

    class T5Font {
        constructor(font, family) {
            this.font = font;
            this.family = family;
        }
    }

    $.loadFont = function (path, callback) {
        window.t5PreloadCount++;
        const family = 'CustomFont' + window.t5PreloadCount;
        const font = new FontFace(family, `url(${path})`);
        const t5Font = new T5Font(font, family);
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            window.t5PreloadDone++;
            if (callback) {
                callback(t5Font);
            }
        }).catch((error) => {
            window.t5PreloadDone++;
            console.error(`Failed to load font at path: ${path}. Error: ${error}`);
        });
        return t5Font;
    };

};

// Apply the text module
T5.addOns.text(T5.prototype, T5.prototype);

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

        reflect(n) {
            n.normalize();
            return this.sub(n.mult(2 * this.dot(n)));
        }

        static reflect(v, n) {
            n = n.copy().normalize();
            return v.copy().sub(n.mult(2 * v.dot(n)));
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
//************************************************************************//
//********************************-T5Dom-*********************************//
//************************************************************************//
class T5Element {
    constructor(element) {
        this.canvas = element;
        this.elt = element;
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

    checked(checked) {
        if (checked === undefined) {
            return this.element.checked;
        } else {
            this.element.checked = checked;
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

    input(callback) {
        return this._addEventListener('input', callback), this;
    }

    // New properties for .x, .y, .width, and .height
    get x() {
        return parseFloat(this.element.style.left || this.element.offsetLeft);
    }

    set x(value) {
        this.element.style.position = 'absolute';
        this.element.style.left = `${value}px`;
    }

    get y() {
        return parseFloat(this.element.style.top || this.element.offsetTop);
    }

    set y(value) {
        this.element.style.position = 'absolute';
        this.element.style.top = `${value}px`;
    }

    get width() {
        return parseFloat(this.element.style.width || this.element.offsetWidth);
    }

    set width(value) {
        this.element.style.width = `${value}px`;
    }

    get height() {
        return parseFloat(this.element.style.height || this.element.offsetHeight);
    }

    set height(value) {
        this.element.style.height = `${value}px`;
    }
}

T5.addOns.dom = ($, p, globalScope) => {
    if (!$.createElement) {
        $.createElement = (tag, html = '') => {
            const el = document.createElement(tag);
            el.innerHTML = html;
            document.body.appendChild(el);
            return new T5Element(el);
        };
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
            checkbox.attribute('type', 'checkbox').checked(checked);
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

    const dom = new T5Dom();

    $.select = (selector) => dom.select(selector);
    $.selectAll = (selector) => dom.selectAll(selector);
    $.removeElements = () => dom.removeElements();
    $.createDiv = (html) => dom.createDiv(html);
    $.createP = (html) => dom.createP(html);
    $.createSpan = (html) => dom.createSpan(html);
    $.createImg = (src, alt) => dom.createImg(src, alt);
    $.createA = (href, html) => dom.createA(href, html);
    $.createSlider = (min, max, value, step) => dom.createSlider(min, max, value, step);
    $.createButton = (label, callback) => dom.createButton(label, callback);
    $.createCheckbox = (label, checked) => dom.createCheckbox(label, checked);
    $.createSelect = (options) => dom.createSelect(options);
    $.createRadio = (name, options) => dom.createRadio(name, options);
    $.createColorPicker = (value) => dom.createColorPicker(value);
    $.createInput = (value, type) => dom.createInput(value, type);
    $.createFileInput = (callback) => dom.createFileInput(callback);
    $.createVideo = (src) => dom.createVideo(src);
    $.createAudio = (src) => dom.createAudio(src);
    $.createCapture = () => dom.createCapture();

    if ($._globalSketch) {
        globalScope.select = $.select;
        globalScope.selectAll = $.selectAll;
        globalScope.removeElements = $.removeElements;
        globalScope.createDiv = $.createDiv;
        globalScope.createP = $.createP;
        globalScope.createSpan = $.createSpan;
        globalScope.createImg = $.createImg;
        globalScope.createA = $.createA;
        globalScope.createSlider = $.createSlider;
        globalScope.createButton = $.createButton;
        globalScope.createCheckbox = $.createCheckbox;
        globalScope.createSelect = $.createSelect;
        globalScope.createRadio = $.createRadio;
        globalScope.createColorPicker = $.createColorPicker;
        globalScope.createInput = $.createInput;
        globalScope.createFileInput = $.createFileInput;
        globalScope.createVideo = $.createVideo;
        globalScope.createAudio = $.createAudio;
        globalScope.createCapture = $.createCapture;
    }
};

// Integrate the dom add-on
T5.addOns.dom(T5.prototype, T5.prototype, window);
//************************************************************************//
//*******************************-T5Input-********************************//
//************************************************************************//
T5.addOns.input = ($, p, globalScope) => {
    globalScope = $
    $.defineConstant('UP_ARROW', 38);
    $.defineConstant('DOWN_ARROW', 40);
    $.defineConstant('LEFT_ARROW', 37);
    $.defineConstant('RIGHT_ARROW', 39);
    $.defineConstant('SHIFT', 16);
    $.defineConstant('TAB', 9);
    $.defineConstant('BACKSPACE', 8);
    $.defineConstant('ENTER', 13);
    $.defineConstant('RETURN', 13);
    $.defineConstant('ALT', 18);
    $.defineConstant('OPTION', 18);
    $.defineConstant('CONTROL', 17);
    $.defineConstant('DELETE', 46);
    $.defineConstant('ESCAPE', 27);

    $.defineConstant('ARROW', 'default');
    $.defineConstant('CROSS', 'crosshair');
    $.defineConstant('HAND', 'pointer');
    $.defineConstant('MOVE', 'move');
    $.defineConstant('TEXT', 'text');

    class T5Input {
        constructor() {
            this.keysPressed = new Set();
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
            // this._initEventListeners();
        }

        _initEventListeners() {
            if (!$.initEventListenersActive) {
                $.initEventListenersActive = true
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
        }

        _keyPressed(e) {
            this.keysPressed.add(e.keyCode);
            this.keyIsPressed = true;
            this.key = e.key;
            this.keyCode = e.keyCode;
            if (typeof window.keyPressed === 'function') {
                window.keyPressed(e);
            }
        }

        _keyReleased(e) {
            this.keysPressed.delete(e.keyCode);
            this.keyIsPressed = this.keysPressed.size > 0;
            this.key = e.key;
            this.keyCode = e.keyCode;

            if (typeof window.keyReleased === 'function') {
                window.keyReleased(e);
            }
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

        _calculateCanvasMetrics() {
            if (!$) { return }
            const { canvas } = $;
            if (!canvas) { return }
            const rect = canvas.getBoundingClientRect();
            const aspectRatioCanvas = canvas.width / canvas.height;
            const aspectRatioRect = rect.width / rect.height;

            const isCanvasWider = aspectRatioCanvas > aspectRatioRect;
            const displayedWidth = isCanvasWider ? rect.width : rect.height * aspectRatioCanvas;
            const displayedHeight = isCanvasWider ? rect.width / aspectRatioCanvas : rect.height;

            this.canvasMetrics = {
                offsetX: (rect.width - displayedWidth) / 2,
                offsetY: (rect.height - displayedHeight) / 2,
                scaleX: canvas.width / displayedWidth,
                scaleY: canvas.height / displayedHeight,
                rect,
                width: window.innerWidth,
                height: window.innerHeight
            };
        }

        _updateMouse(e) {
            if (e.changedTouches) return;

            const { canvasMetrics } = this;
            if (!canvasMetrics || window.innerWidth !== canvasMetrics.width || window.innerHeight !== canvasMetrics.height) {
                this._calculateCanvasMetrics();
            }
            if (!this.canvasMetrics) { return }
            const { offsetX, offsetY, scaleX, scaleY, rect } = this.canvasMetrics;
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            this._pmouseX = this._mouseX;
            this._pmouseY = this._mouseY;
            this._mouseX = (e.clientX - rect.left - offsetX + scrollX) * scaleX;
            this._mouseY = (e.clientY - rect.top - offsetY + scrollY) * scaleY;
            this._pwinMouseX = this._winMouseX;
            this._pwinMouseY = this._winMouseY;
            this._winMouseX = e.clientX + scrollX;
            this._winMouseY = e.clientY + scrollY;
        }

        keyIsDown(keyCode) {
            return this.keysPressed.has(keyCode);
        }

        requestPointerLock() {
            if ($.canvas) {
                $.canvas.requestPointerLock();
            }
        }

        exitPointerLock() {
            document.exitPointerLock();
        }

        cursor(type = 'default', x = 0, y = 0) {
            const canvas = $.canvas;
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
            const canvas = $.canvas;
            canvas.style.cursor = 'none';
        }

        get mouseX() {
            return $.scaleT5Mouse(this._mouseX);
        }

        get mouseY() {
            return $.scaleT5Mouse(this._mouseY);
        }

        get pmouseX() {
            return this._pmouseX;
        }

        get pmouseY() {
            return this._pmouseY;
        }

        get winMouseX() {
            return $.scaleT5Mouse(this._winMouseX);
        }

        get winMouseY() {
            return $.scaleT5Mouse(this._winMouseY);
        }

        get pwinMouseX() {
            return this._pwinMouseX;
        }

        get pwinMouseY() {
            return this._pwinMouseY;
        }

    }

    const t5Input = new T5Input();
    t5Input._initEventListeners();

    const properties = [
        'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'winMouseX', 'winMouseY', 'pwinMouseX', 'pwinMouseY',
        'mouseButton', 'mouseIsPressed'
    ];

    properties.forEach(prop => {
        if (!(prop in window)) {
            Object.defineProperty(window, prop, {
                get: function () {
                    return t5Input[prop];
                }
            });
        }
    });

    if (!('keyIsPressed' in window)) {
        Object.defineProperty(window, 'keyIsPressed', {
            get: function () {
                return t5Input.keyIsPressed;
            }
        });
    }
    if (!('key' in window)) {
        Object.defineProperty(window, 'key', {
            get: function () {
                return t5Input.key;
            }
        });
    }
    if (!('keyCode' in window)) {
        Object.defineProperty(window, 'keyCode', {
            get: function () {
                return t5Input.keyCode;
            }
        });
    }
    if (!('keyIsDown' in window)) {
        globalScope.keyIsDown = (code) => t5Input.keyIsDown(code);
    }
    if (!('movedX' in window)) {
        globalScope.movedX = () => t5Input.movedX;
    }
    if (!('movedY' in window)) {
        globalScope.movedY = () => t5Input.movedY;
    }
    if (!('requestPointerLock' in window)) {
        globalScope.requestPointerLock = () => t5Input.requestPointerLock();
    }
    if (!('exitPointerLock' in window)) {
        globalScope.exitPointerLock = () => t5Input.exitPointerLock();
    }
    if (!('cursor' in window)) {
        globalScope.cursor = (type, x, y) => t5Input.cursor(type, x, y);
    }
    if (!('noCursor' in window)) {
        globalScope.noCursor = () => t5Input.noCursor();
    }

    $.disableContextMenu = function () {
        if ($.canvas) {
            $.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }
};

// Integrate the input add-on
T5.addOns.input(T5.prototype, T5.prototype, window);
//************************************************************************//
//*******************************-T5Sound-********************************//
//************************************************************************//
T5.addOns.sound = ($, p, globalScope) => {
    class T5Sound {
        constructor(baseT5) {
            this.baseT5 = baseT5;
            this.sound = null;
            this.loaded = false;
            this.looping = false;
            this.playing = false;
            this.paused = false;
            this.volume = 1;
            this.rate = 1;
            this.duration = 0;
        }

        loadSound(path, callback) {
            window.t5PreloadCount++;
            const audio = new Audio();
            this.sound = audio;
            audio.src = path;
            audio.addEventListener('canplaythrough', () => {
                this.loaded = true;
                this.duration = audio.duration;
                window.t5PreloadDone++;
                if (callback) {
                    callback(this);
                }
            }, false);
            audio.addEventListener('error', (e) => {
                console.error(`Failed to load sound: ${path}`, e);
                window.t5PreloadDone++;
                if (callback) {
                    callback(null);
                }
            });
            audio.addEventListener('ended', () => {
                this.playing = false;
            });
            return this;
        }

        isLoaded() {
            return this.loaded;
        }

        async play() {
            if (this.loaded && !this.playing) {
                try {
                    await this.sound.play();
                    this.playing = true;
                    this.paused = false;
                } catch (e) {
                    console.error('Error playing sound:', e);
                }
            }
        }

        pause() {
            if (this.loaded && this.playing) {
                this.sound.pause();
                this.playing = false;
                this.paused = true;
            }
        }

        stop() {
            if (this.loaded) {
                this.sound.pause();
                this.sound.currentTime = 0;
                this.playing = false;
                this.paused = false;
            }
        }

        loop() {
            if (this.loaded) {
                this.sound.loop = true;
                this.play();
                this.looping = true;
            }
        }

        setLoop(loop) {
            if (this.loaded) {
                this.sound.loop = loop;
                this.looping = loop;
            }
        }

        isLooping() {
            return this.looping;
        }

        isPlaying() {
            return this.playing && !this.sound.paused;
        }

        isPaused() {
            return this.paused;
        }

        setVolume(volume) {
            if (this.loaded) {
                this.sound.volume = volume;
                this.volume = volume;
            }
        }

        getVolume() {
            return this.volume;
        }

        setRate(rate) {
            if (this.loaded) {
                this.sound.playbackRate = rate;
                this.rate = rate;
            }
        }

        getRate() {
            return this.rate;
        }

        getDuration() {
            return this.duration;
        }

        getCurrentTime() {
            if (this.loaded) {
                return this.sound.currentTime;
            }
            return 0;
        }

        jump(time) {
            if (this.loaded) {
                this.sound.currentTime = time;
            }
        }
    }

    $.loadSound = function (path, callback) {
        const soundFile = new T5Sound($);
        return soundFile.loadSound(path, callback);
    };

    $.playSound = function (soundFile) {
        if (soundFile) {
            soundFile.play();
        }
    };

    $.pauseSound = function (soundFile) {
        if (soundFile) {
            soundFile.pause();
        }
    };

    $.stopSound = function (soundFile) {
        if (soundFile) {
            soundFile.stop();
        }
    };

    $.loopSound = function (soundFile) {
        if (soundFile) {
            soundFile.loop();
        }
    };

    $.setLoopSound = function (soundFile, loop) {
        if (soundFile) {
            soundFile.setLoop(loop);
        }
    };

    $.isLoopingSound = function (soundFile) {
        return soundFile ? soundFile.isLooping() : false;
    };

    $.isPlayingSound = function (soundFile) {
        return soundFile ? soundFile.isPlaying() : false;
    };

    $.isPausedSound = function (soundFile) {
        return soundFile ? soundFile.isPaused() : false;
    };

    $.setVolumeSound = function (soundFile, volume) {
        if (soundFile) {
            soundFile.setVolume(volume);
        }
    };

    $.getVolumeSound = function (soundFile) {
        return soundFile ? soundFile.getVolume() : 0;
    };

    $.setRateSound = function (soundFile, rate) {
        if (soundFile) {
            soundFile.setRate(rate);
        }
    };

    $.getRateSound = function (soundFile) {
        return soundFile ? soundFile.getRate() : 0;
    };

    $.getDurationSound = function (soundFile) {
        return soundFile ? soundFile.getDuration() : 0;
    };

    $.getCurrentTimeSound = function (soundFile) {
        return soundFile ? soundFile.getCurrentTime() : 0;
    };

    $.jumpSound = function (soundFile, time) {
        if (soundFile) {
            soundFile.jump(time);
        }
    };

    if ($._globalSketch) {
        globalScope.loadSound = $.loadSound;
        globalScope.playSound = $.playSound;
        globalScope.pauseSound = $.pauseSound;
        globalScope.stopSound = $.stopSound;
        globalScope.loopSound = $.loopSound;
        globalScope.setLoopSound = $.setLoopSound;
        globalScope.isLoopingSound = $.isLoopingSound;
        globalScope.isPlayingSound = $.isPlayingSound;
        globalScope.isPausedSound = $.isPausedSound;
        globalScope.setVolumeSound = $.setVolumeSound;
        globalScope.getVolumeSound = $.getVolumeSound;
        globalScope.setRateSound = $.setRateSound;
        globalScope.getRateSound = $.getRateSound;
        globalScope.getDurationSound = $.getDurationSound;
        globalScope.getCurrentTimeSound = $.getCurrentTimeSound;
        globalScope.jumpSound = $.jumpSound;
    }
};

// Integrate the sound add-on
T5.addOns.sound(T5.prototype, T5.prototype, window);

//************************************************************************//
//********************************-T5Art-*********************************//
//************************************************************************//
T5.addOns.art = ($, p) => {
    $.defineConstant('LINEAR', 'linear');
    $.defineConstant('RADIAL', 'radial');

    function createT5Gradient(type, config) {
        let gradient;
        let startX, startY, endX, endY, radius;

        // Extract coordinates and radius based on the gradient type
        if (type === $.LINEAR) {
            ({ startX, startY, endX, endY } = config[0]);
            [startX, startY, endX, endY] = $.scaleT5Coords([startX, startY, endX, endY]);

            gradient = $.context.createLinearGradient(startX, startY, endX, endY);
        } else if (type === $.RADIAL) {
            ({ startX, startY, radius } = config[0]);
            [startX, startY, radius] = $.scaleT5Coords([startX, startY, radius]);

            gradient = $.context.createRadialGradient(startX, startY, 0, startX, startY, radius);
        } else {
            throw new Error('Invalid gradient type');
        }

        // Add color stops
        for (let i = 1; i < config.length; i++) {
            const { colorStop, color } = config[i];
            const parsedColor = $.color(color);
            gradient.addColorStop(colorStop, parsedColor.toString());
        }

        return gradient;
    }

    $.gradientFill = function (type, config) {
        const gradient = createT5Gradient(type, config);
        $.context.fillStyle = gradient;
    };

    $.gradientStroke = function (type, config) {
        const gradient = createT5Gradient(type, config);
        $.context.strokeStyle = gradient;
    };
    $.gradientBackground = function (type, config) {
        const gradient = createT5Gradient(type, config);
        $.context.save();
        $.context.fillStyle = gradient;
        $.context.fillRect(0, 0, $.canvas.width, $.canvas.height);
        $.context.restore();
    };

    $.noiseLine = function (x1, y1, x2, y2, noiseScale = 0.05, noiseStrength = 35) {
        const distance = $.dist(x1, y1, x2, y2);
        const steps = Math.ceil(distance / 5);
        const linePoints = [];
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const cosAngleHalfPi = Math.cos(angle + $.HALF_PI);
        const sinAngleHalfPi = Math.sin(angle + $.HALF_PI);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = $.lerp(x1, x2, t);
            const y = $.lerp(y1, y2, t);
            const noiseValue = $.noise(i * noiseScale);
            const offset = (noiseValue - 0.5) * noiseStrength;
            const offsetX = cosAngleHalfPi * offset;
            const offsetY = sinAngleHalfPi * offset;

            linePoints.push({ x: x + offsetX, y: y + offsetY });
        }

        $.beginShape();
        linePoints.forEach(point => $.vertex(point.x, point.y));
        $.endShape();
    };

    $.noiseEllipse = function (cx, cy, radius, noiseScale = 0.1, noiseStrength = 30, steps = 50) {
        const angleIncrement = $.TWO_PI / steps;
        const ellipsePoints = [];

        for (let i = 0; i <= steps; i++) {
            const angle = i * angleIncrement;
            const noiseValue = $.noise(i * noiseScale);
            const offset = (noiseValue - 0.5) * noiseStrength;
            const currentRadius = radius + offset;
            const x = cx + Math.cos(angle) * currentRadius;
            const y = cy + Math.sin(angle) * currentRadius;

            ellipsePoints.push({ x: x, y: y });
        }

        $.beginShape();
        ellipsePoints.forEach(point => $.vertex(point.x, point.y));
        $.endShape(CLOSE);
    };

    $.noiseRect = function (x, y, width, height = width, noiseScale = 0.1, noiseStrength = 35) {
        const addNoiseLinePoints = (x1, y1, x2, y2, points) => {
            const distance = $.dist(x1, y1, x2, y2);
            const steps = Math.ceil(distance / 5);
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const cosAngleHalfPi = Math.cos(angle + $.HALF_PI);
            const sinAngleHalfPi = Math.sin(angle + $.HALF_PI);

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = $.lerp(x1, x2, t);
                const y = $.lerp(y1, y2, t);
                const noiseValue = $.noise(i * noiseScale);
                const offset = (noiseValue - 0.5) * noiseStrength;
                const offsetX = cosAngleHalfPi * offset;
                const offsetY = sinAngleHalfPi * offset;

                points.push({ x: x + offsetX, y: y + offsetY });
            }
        };

        const rectPoints = [];

        addNoiseLinePoints(x, y, x + width, y, rectPoints);
        addNoiseLinePoints(x + width, y, x + width, y + height, rectPoints);
        addNoiseLinePoints(x + width, y + height, x, y + height, rectPoints);
        addNoiseLinePoints(x, y + height, x, y, rectPoints);

        $.beginShape();
        rectPoints.forEach(point => $.vertex(point.x, point.y));
        $.endShape(CLOSE);
    };


    $.polygon = function (x, y, radius, verts) {
        const angleOffset = -Math.PI / 2;
        const angleIncrement = (2 * Math.PI) / verts;
        $.beginShape();
        for (let i = 0; i < verts; i++) {
            const angle = i * angleIncrement + angleOffset;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            $.vertex(vx, vy);
        }
        $.endShape(true);
    }

    $.star = function (x, y, radius1, radius2, points) {
        const angleOffset = -Math.PI / 2;
        const angleIncrement = (2 * Math.PI) / points;
        $.beginShape();
        for (let i = 0; i < points * 2; i++) {
            const angle = i * angleIncrement / 2 + angleOffset;
            const radius = (i % 2 === 0) ? radius1 : radius2;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            $.vertex(vx, vy);
        }
        $.endShape(true);
    };

    $.hollowRect = function (x, y, w, h = w, innerPadding = 20) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentRectMode) {
                case 'corner':
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    break;
                case 'center':
                    x = x - w / 2;
                    y = y - h / 2;
                    break;
                case 'radius':
                    x = x - w;
                    y = y - h;
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }
            let innerX = x + innerPadding;
            let innerY = y + innerPadding;
            let innerW = w - 2 * innerPadding;
            let innerH = h - 2 * innerPadding;
            $.beginShape();
            $.vertex(x, y);
            $.vertex(x + w, y);
            $.vertex(x + w, y + h);
            $.vertex(x, y + h);
            $.innerVertex(innerX, innerY);
            $.innerVertex(innerX + innerW, innerY);
            $.innerVertex(innerX + innerW, innerY + innerH);
            $.innerVertex(innerX, innerY + innerH);
            $.endShape(CLOSE);

        }
    };

    $.hollowPolygon = function (x, y, radius, verts, innerRadius) {
        if ($.context) {
            const angleOffset = -Math.PI / 2;
            const angleIncrement = (2 * Math.PI) / verts;

            $.beginShape();
            for (let i = 0; i < verts; i++) {
                const angle = i * angleIncrement + angleOffset;
                const vx = x + Math.cos(angle) * radius;
                const vy = y + Math.sin(angle) * radius;
                $.vertex(vx, vy);
            }
            for (let i = 0; i < verts; i++) {
                const angle = i * angleIncrement + angleOffset;
                const ivx = x + Math.cos(angle) * innerRadius;
                const ivy = y + Math.sin(angle) * innerRadius;
                $.innerVertex(ivx, ivy);
            }
            $.endShape(CLOSE);
        }
    };

    $.hollowStar = function (x, y, radius1, radius2, points, innerRadius1, innerRadius2) {
        if ($.context) {
            const angleOffset = -Math.PI / 2;
            const angleIncrement = (2 * Math.PI) / points;

            $.beginShape();
            for (let i = 0; i < points * 2; i++) {
                const angle = i * angleIncrement / 2 + angleOffset;
                const radius = (i % 2 === 0) ? radius1 : radius2;
                const vx = x + Math.cos(angle) * radius;
                const vy = y + Math.sin(angle) * radius;
                $.vertex(vx, vy);
            }
            for (let i = 0; i < points * 2; i++) {
                const angle = i * angleIncrement / 2 + angleOffset;
                const innerRadius = (i % 2 === 0) ? innerRadius1 : innerRadius2;
                const ivx = x + Math.cos(angle) * innerRadius;
                const ivy = y + Math.sin(angle) * innerRadius;
                $.innerVertex(ivx, ivy);
            }
            $.endShape(CLOSE);
        }
    };

    $.hollowEllipse = function (x, y, w, h = w, innerPadding = 20) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            let innerW = w - 2 * innerPadding;
            let innerH = h - 2 * innerPadding;

            $.beginShape();
            // Outer ellipse
            for (let angle = 0; angle < TWO_PI; angle += 0.1) {
                let outerX = x + cos(angle) * w / 2;
                let outerY = y + sin(angle) * h / 2;
                $.vertex(outerX, outerY);
            }

            // Inner ellipse
            for (let angle = 0; angle < TWO_PI; angle += 0.1) {
                let innerX = x + cos(angle) * innerW / 2;
                let innerY = y + sin(angle) * innerH / 2;
                $.innerVertex(innerX, innerY);
            }
            $.endShape(CLOSE);
        }
    };

    $.fillArea = (x, y, ...colorArgs) => {
        const ctx = $.context, canvas = $.canvas;
        [x, y] = $.scaleT5Coords([x, y]);
        [x, y] = [Math.floor(x), Math.floor(y)];

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            console.warn(`fillArea: Coordinates (${x}, ${y}) are out of canvas bounds (width: ${canvas.width}, height: ${canvas.height}).`);
            return;
        }

        const fillColor = handleColorArgument(colorArgs);
        if (!fillColor) {
            console.warn('Invalid fill color');
            return;
        }

        const colorObj = $.color(fillColor);
        const fillColorLevels = colorObj.levels;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width, height = canvas.height;
        const targetColor = getColorAt(x, y, data, width);
        const stack = [[x, y]];
        const visited = new Uint8Array(width * height);

        while (stack.length) {
            const [currX, currY] = stack.pop();
            if (currX < 0 || currX >= width || currY < 0 || currY >= height) continue;

            let startX = currX;
            while (startX >= 0 && colorsMatch(getColorAt(startX, currY, data, width), targetColor)) startX--;
            startX++;

            let endX = currX;
            while (endX < width && colorsMatch(getColorAt(endX, currY, data, width), targetColor)) endX++;
            endX--;

            for (let i = startX; i <= endX; i++) {
                const index = currY * width + i;
                if (!visited[index]) {
                    setColorAt(i, currY, fillColorLevels, data, width);
                    visited[index] = 1;
                    if (currY > 0) stack.push([i, currY - 1]);
                    if (currY < height - 1) stack.push([i, currY + 1]);
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    function getColorAt(x, y, data, width) {
        const idx = (y * width + x) * 4;
        return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    }

    function setColorAt(x, y, color, data, width) {
        const idx = (y * width + x) * 4;
        [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = color;
    }

    function colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    function handleColorArgument(args) {
        if (args.length === 1 && $.isColorObject(args[0])) {
            return args[0].toString();
        } else {
            const colorObj = $.color(...args);
            return colorObj ? colorObj.toString() : null;
        }
    }

};

T5.addOns.art(T5.prototype, T5.prototype);
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
            if (!this.rotationEnabled) {
                Body.setAngle(this.body, 0); // Prevent rotation by setting angle to 0
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
