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
    $.defineConstant('SEPIA', 'SEPIA');
    $.defineConstant('BRIGHTNESS', 'BRIGHTNESS');
    $.defineConstant('SATURATION', 'SATURATION');
    $.defineConstant('CONTRAST', 'CONTRAST');

    $.filter = function (mode, value) {
        if (!$.context) return;

        const tmpCanvas = document.createElement('canvas');
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = $.canvas.width;
        tmpCanvas.height = $.canvas.height;

        tmpCtx.drawImage($.canvas, 0, 0, $.canvas.width, $.canvas.height);

        const imageData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
        const data = imageData.data;
        const width = tmpCanvas.width;
        const height = tmpCanvas.height;

        switch (mode) {
            case GRAY:
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.155 * data[i] + 0.597 * data[i + 1] + 0.319 * data[i + 2];
                    data[i] = data[i + 1] = data[i + 2] = gray;
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
                const levels = value;
                const levelsMinusOne = levels - 1;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = ((data[i] * levels) >> 8) * 255 / levelsMinusOne;
                    data[i + 1] = ((data[i + 1] * levels) >> 8) * 255 / levelsMinusOne;
                    data[i + 2] = ((data[i + 2] * levels) >> 8) * 255 / levelsMinusOne;
                }
                break;

            case THRESHOLD:
                const threshold = value !== undefined ? value * 255 : 128;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const val = avg >= threshold ? 255 : 0;
                    data[i] = data[i + 1] = data[i + 2] = val;
                }
                break;

            case OPAQUE:
                for (let i = 0; i < data.length; i += 4) {
                    data[i + 3] = 255; // Set alpha to fully opaque
                }
                break;

            case DILATE:
            case ERODE:
                applyMorphologicalFilter(data, width, height, mode === DILATE);
                break;

            case BLUR:
            case SEPIA:
            case BRIGHTNESS:
            case SATURATION:
            case CONTRAST:
                // Use CSS filter for supported modes
                let cssFilter = '';
                if (mode === BLUR) {
                    const radius = Math.ceil(value) || 1;
                    cssFilter = `blur(${radius}px)`;
                } else if (mode === SEPIA) {
                    cssFilter = `sepia(${value ?? 1})`;
                } else if (mode === BRIGHTNESS) {
                    cssFilter = `brightness(${value ?? 1})`;
                } else if (mode === SATURATION) {
                    cssFilter = `saturate(${value ?? 1})`;
                } else if (mode === CONTRAST) {
                    cssFilter = `contrast(${value ?? 1})`;
                }

                $.context.filter = cssFilter;
                $.context.drawImage(tmpCanvas, 0, 0);
                $.context.filter = 'none';
                return;

            default:
                throw new Error('Unsupported filter mode: ' + mode);
        }

        tmpCtx.putImageData(imageData, 0, 0);
        $.context.drawImage(tmpCanvas, 0, 0);
    };

    function applyMorphologicalFilter(data, width, height, isDilate) {
        const copyData = new Uint8ClampedArray(data);
        const pixel = (x, y, c) => copyData[(y * width + x) * 4 + c];
        const setPixel = (x, y, c, value) => { data[(y * width + x) * 4 + c] = value; };

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let extreme = isDilate ? 0 : 255;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const val = pixel(x + kx, y + ky, c);
                            if (isDilate) {
                                extreme = Math.max(extreme, val);
                            } else {
                                extreme = Math.min(extreme, val);
                            }
                        }
                    }
                    setPixel(x, y, c, extreme);
                }
            }
        }
    }

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