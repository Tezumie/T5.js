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

    function handleColorArgument(args) {
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
