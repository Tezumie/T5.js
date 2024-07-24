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
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
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

    $.color = function (...args) {
        if (args.length === 1 && typeof args[0] === 'string') {
            return parseColorString(args[0]);
        } else if (args.length === 1 && typeof args[0] === 'number') {
            return new ColorRGBA(args[0], args[0], args[0]);
        } else if (args.length === 1 && Array.isArray(args[0])) {
            return new ColorRGBA(...args[0]);
        } else if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
            return new ColorRGBA(args[0], args[0], args[0], args[1]);
        } else if (args.length >= 3) {
            return new ColorRGBA(args[0], args[1], args[2], args[3]);
        }
        return null;
    };

    $.isColorObject = function (obj) {
        return obj instanceof ColorRGBA;
    };

    function handleColorArgument(args) {
        if (args.length === 1 && $.isColorObject(args[0])) {
            return args[0].toString();
        } else if (args.length === 1 && Array.isArray(args[0])) {
            const colorObj = $.color(...args[0]);
            return colorObj ? colorObj.toString() : null;
        } else {
            const colorObj = $.color(...args);
            return colorObj ? colorObj.toString() : null;
        }
    }

    $.fill = function (...args) {
        const colorString = handleColorArgument(args);
        if (colorString) {
            $.context.fillStyle = colorString;
            $.textFillColor = colorString;
        }
    };

    $.stroke = function (...args) {
        const colorString = handleColorArgument(args);
        if (colorString) {
            $.context.strokeStyle = colorString;
            $.textStrokeColor = colorString;
        }
    };

    $.background = function (...args) {
        const colorString = handleColorArgument(args);
        if (colorString) {
            $.context.save();
            $.context.fillStyle = colorString;
            $.context.fillRect(0, 0, $.canvas.width, $.canvas.height);
            $.context.restore();
        }
    };

    $.noFill = function () {
        $.context.fillStyle = 'rgba(0,0,0,0)';
        $.textFillColor = 'rgba(0,0,0,0)';
    };

    $.noStroke = function () {
        $.context.strokeStyle = 'rgba(0,0,0,0)';
        $.textStrokeColor = 'rgba(0,0,0,0)';
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
        const colorString = handleColorArgument(args);
        if (colorString) {
            $.currentTint = colorString;
        }
    };

    $.noTint = function () {
        $.currentTint = null;
    };

    // Extract color components
    $.red = function (col) {
        const colorObj = $.color(col);
        return colorObj.r;
    };

    $.green = function (col) {
        const colorObj = $.color(col);
        return colorObj.g;
    };

    $.blue = function (col) {
        const colorObj = $.color(col);
        return colorObj.b;
    };

    $.alpha = function (col) {
        const colorObj = $.color(col);
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
