//************************************************************************//
//********************************-T5Image-*******************************//
//************************************************************************//
T5.addOns.image = ($, p) => {
    class T5Image {
        constructor(img) {
            this.img = img;
            this.width = img.width;
            this.height = img.height;
        }
    }

    $.loadImage = function (path, callback) {
        window.t5PreloadCount++;
        const img = new Image();
        const t5Img = new T5Image(img);
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            window.t5PreloadDone++;
            if (callback) {
                callback(t5Img);
            }
        };
        img.onerror = (err) => {
            window.t5PreloadDone++;
            console.error(`Failed to load image at path: ${path}. Please check your image path.`);
        };
        img.src = path;
        return t5Img;
    };


    // Create a temporary canvas for tinting operations

    let tmpCanvas = null;
    function makeTmpCtx(width, height) {
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

    $.image = function (img, x, y, w, h) {
        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
        if (!img) return;
        let source;
        if (img instanceof T5Image) {
            source = img.img;
        } else if (img instanceof $.Graphics) {
            source = img.canvas;
        } else if (img instanceof Image) {
            source = img;
        } else if (img.img) {
            source = img.img
        } else {
            throw new Error("Invalid image object. Ensure you're using 'loadImage(path)' to load images.");
        }
        let offset = $.scaleT5Coord(0.65)
        let width = w + offset || $.scaleT5Coord(source.width) + offset;
        let height = h + offset || $.scaleT5Coord(source.height) + offset;

        if ($.currentTint) {
            const tmpCtx = makeTmpCtx(width, height);

            // Draw the image to the temporary canvas
            tmpCtx.clearRect(0, 0, width, height);
            tmpCtx.drawImage(source, 0, 0, width, height);

            // Extract RGB and Alpha values from the current tint
            const tintRGB = extractRGBFromColorString($.currentTint);
            const tintAlpha = extractAlphaFromColorString($.currentTint);

            // Apply the tint color using the 'multiply' blend mode
            tmpCtx.globalCompositeOperation = 'multiply';
            tmpCtx.fillStyle = tintRGB;
            tmpCtx.fillRect(0, 0, width, height);

            // Draw the tinted image back to the main canvas with the correct alpha
            $.context.save();
            $.context.globalAlpha = tintAlpha;
            $.context.drawImage(tmpCanvas, x, y, width, height);
            $.context.globalAlpha = 1; // Reset alpha to default
            $.context.restore();
        } else {
            $.context.drawImage(source, x, y, width, height);
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
