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
