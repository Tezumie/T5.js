//************************************************************************//
//********************************-T5Art-*********************************//
//************************************************************************//
T5.addOns.art = ($, p) => {
    $.defineConstant('LINEAR', 'linear');
    $.defineConstant('RADIAL', 'radial');

    function createT5Gradient(type, config) {
        let gradient;
        let startX, startY, endX, endY, radius;

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

        for (let i = 1; i < config.length; i++) {
            const { colorStop, color } = config[i];
            const parsedColor = $.color(color);

            if (!parsedColor || parsedColor.levels[3] === 0) {
                continue;
            }

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