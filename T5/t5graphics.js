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