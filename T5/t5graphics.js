//************************************************************************//
//******************************-T5Graphics-******************************//
//************************************************************************//
T5.addOns.createGraphics = ($, p) => {
    class Graphics extends T5 {
        constructor(w, h, parent) {
            super('local', parent);
            this.canvas = $.createElement('canvas').element;
            this.canvas.width = w;
            this.canvas.height = h;
            this.context = this.canvas.getContext('2d');
            this.ctx = this.context;
            this.width = w;
            this.height = h;
            this._offscreen = true;
            this.context.fillStyle = 'rgb(255, 255, 255)';
            this.context.strokeStyle = 'rgb(0, 0, 0)';
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);
            this.ctx = this.context = this.canvas.getContext('2d');
        }
    }

    $.createGraphics = function (w, h) {
        return new Graphics(w, h, $);
    };

    $.Graphics = Graphics;
};

T5.addOns.createGraphics(T5.prototype, T5.prototype);