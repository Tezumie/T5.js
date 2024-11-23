//************************************************************************//
//********************************-T5Image-*******************************//
//************************************************************************//
T5.addOns.image = ($, p) => {
    class T5Image {
        constructor(img) {
            this.img = img;
            this.width = 0;
            this.height = 0;
        }

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

            const t5Img = new T5Image(img);
            t5Img.setDimensions(img.width, img.height);

            if (callback) {
                callback(t5Img);
            }
        };

        img.onerror = (err) => {
            window.t5PreloadDone++;
            console.error(`Failed to load image at path: ${path}. Please check your image path.`);
        };

        img.src = path;
        return img;
    };

    $.createImage = function (width, height, bgColor = null) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (bgColor) {
            $.fill(bgColor)
            context.fillRect(0, 0, width, height);
        }

        const newImage = new T5Image(canvas);
        newImage.drawingContext = context
        newImage.setDimensions(width, height);

        return newImage;
    };

    let tmpCanvas = null;

    function createTempCanvas(width, height) {
        if (tmpCanvas != null) {
            return tmpCanvas.tmpCtx;
        } else {
            tmpCanvas = document.createElement('canvas');
            tmpCanvas.tmpCtx = tmpCanvas.getContext('2d');
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            return tmpCanvas.tmpCtx;
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

        w = w !== undefined ? w : source.width;
        h = h !== undefined ? h : source.height;

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
            const tempCtx = createTempCanvas(sw, sh);
            tempCtx.clearRect(0, 0, sw, sh);

            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

            const tintRGB = extractRGBFromColorString($.currentTint);
            tempCtx.globalCompositeOperation = 'multiply';
            tempCtx.fillStyle = tintRGB;
            tempCtx.fillRect(0, 0, sw, sh);

            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

            $.context.drawImage(tempCtx.canvas, 0, 0, sw, sh, x, y, w, h);
        } else {
            $.context.drawImage(source, sx, sy, sw, sh, x, y, w, h);
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
