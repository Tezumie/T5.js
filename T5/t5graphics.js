//************************************************************************//
//******************************-T5Graphics-******************************//
//************************************************************************//
T5.addOns.createGraphics = ($, p) => {
    class Graphics extends T5 {
        constructor(w, h, parent) {
            super('local', parent);
            this.width = w;
            this.height = h;
            this.parent = parent;

            // Create the off-screen canvas
            this.createCanvas(w, h, 'graphics');
            this.canvas.style.display = 'none';
            this.pixelDensity(parent?.t5PixelDensity || 1);
            this.flexibleCanvas(w);
            // this.loadPixels()
            // Store original parent methods for interaction
            this.parentMethods = parent;
        }

        // Override the default `start` to avoid immediate draw loop
        start() {
            // Do not bind to global scope or start loop by default
        }

        // Reinitialize the draw loop for the graphics object if needed
        beginDraw() {
            this._isLooping = true;
            this._shouldDrawOnce = true;
            requestAnimationFrame(() => this._draw());
        }

        // Stop the draw loop for the graphics object
        endDraw() {
            this._isLooping = false;
        }
    }

    $.createGraphics = function (w, h) {
        const graphicsInstance = new Graphics(w, h, $);
        return graphicsInstance;
    };

    $._Graphics = Graphics;
};

T5.addOns.createGraphics(T5.prototype, T5.prototype);
//************************************************************************//
//******************************-T5Graphics-******************************//
//************************************************************************//
// T5.addOns.createGraphics = ($, p) => {
//     class Graphics extends T5 {
//         constructor(w, h, parent) {
//             super('local', parent);
//         }
//     }

//     $.createGraphics = function (w, h) {
//         let p = new Graphics(w, h, $);
//         p.createCanvas(w, h, 'graphics')
//         p.canvas.style.display = 'none'
//         p.pixelDensity($.t5PixelDensity)
//         p.flexibleCanvas(w)

//         return p;
//     };

//     $.Graphics = Graphics;
// };

// T5.addOns.createGraphics(T5.prototype, T5.prototype);