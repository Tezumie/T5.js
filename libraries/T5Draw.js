//************************************************************************//
//********************************-T5Draw-********************************//
//************************************************************************//

class T5Draw {
    constructor(t5Instance) {
        this.t5 = t5Instance;
    }

    noiseLine(x1, y1, x2, y2, noiseScale = 0.1, noiseStrength = 10) {
        const distance = dist(x1, y1, x2, y2);
        const steps = Math.ceil(distance / 5);
        const linePoints = [];
        let noiseOffset = 0;
        const angle = atan2(y2 - y1, x2 - x1);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = lerp(x1, x2, t);
            const y = lerp(y1, y2, t);
            const noiseValue = noise(noiseOffset);
            const offset = (noiseValue - 0.5) * noiseStrength;
            const offsetX = cos(angle + HALF_PI) * offset;
            const offsetY = sin(angle + HALF_PI) * offset;

            linePoints.push({ x: x + offsetX, y: y + offsetY });
            noiseOffset += noiseScale;
        }

        this.t5.beginShape();
        linePoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(false);
    }

    noiseEllipse(x, y, width, height, noiseScale = 0.1, noiseStrength = 10) {
        const ellipsePoints = [];
        const step = TWO_PI / 50;
        let noiseOffset = 0;

        for (let angle = 0; angle < TWO_PI; angle += step) {
            const px = cos(angle) * width / 2;
            const py = sin(angle) * height / 2;

            const noiseValueX = noise(noiseOffset);
            const noiseValueY = noise(noiseOffset + 1000);
            const offsetX = (noiseValueX - 0.5) * noiseStrength;
            const offsetY = (noiseValueY - 0.5) * noiseStrength;

            ellipsePoints.push({ x: x + px + offsetX, y: y + py + offsetY });
            noiseOffset += noiseScale;
        }
        const firstPoint = ellipsePoints[0];
        ellipsePoints.push({ x: firstPoint.x, y: firstPoint.y });
        this.t5.beginShape();
        ellipsePoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(true);
    }

    noiseRect(x, y, width, height, noiseScale = 0.1, noiseStrength = 10) {
        const rectPoints = [];
        let noiseOffsetX = 0;
        let noiseOffsetY = 1000;
        const step = 5;

        const addNoisePoint = (px, py, scale) => {
            const noiseValueX = noise(noiseOffsetX);
            const noiseValueY = noise(noiseOffsetY);
            const offsetX = (noiseValueX - 0.5) * noiseStrength * scale;
            const offsetY = (noiseValueY - 0.5) * noiseStrength * scale;
            rectPoints.push({ x: px + offsetX, y: py + offsetY });
            noiseOffsetX += noiseScale;
            noiseOffsetY += noiseScale;
        };

        // Top edge
        for (let i = 0; i <= width; i += step) {
            const scale = 1 - Math.abs(i / width - 0.5) * 2;
            addNoisePoint(x + i, y, scale);
        }

        // Right edge
        for (let i = 0; i <= height; i += step) {
            const scale = 1 - Math.abs(i / height - 0.5) * 2;
            addNoisePoint(x + width, y + i, scale);
        }

        // Bottom edge
        for (let i = width; i >= 0; i -= step) {
            const scale = 1 - Math.abs(i / width - 0.5) * 2;
            addNoisePoint(x + i, y + height, scale);
        }

        // Left edge
        for (let i = height; i >= 0; i -= step) {
            const scale = 1 - Math.abs(i / height - 0.5) * 2;
            addNoisePoint(x, y + i, scale);
        }

        // Close the shape by connecting to the first point
        rectPoints.push(rectPoints[0]);

        this.t5.beginShape();
        rectPoints.forEach(point => this.t5.vertex(point.x, point.y));
        this.t5.endShape(true);
    }

    gradientFill(color1, color2, x, y, x2, y2) {
        const ctx = this.t5.context;
        const gradient = ctx.createLinearGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(x2),
            this.t5._scaleCoordinate(y2)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.fillStyle = gradient;
    }

    gradientStroke(color1, color2, x, y, x2, y2) {
        const ctx = this.t5.context;
        const gradient = ctx.createLinearGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(x2),
            this.t5._scaleCoordinate(y2)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.strokeStyle = gradient;
    }

    radialFill(color1, color2, x, y, radius) {
        const ctx = this.t5.context;
        const gradient = ctx.createRadialGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            0,
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(radius)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.fillStyle = gradient;
    }

    radialStroke(color1, color2, x, y, radius) {
        const ctx = this.t5.context;
        const gradient = ctx.createRadialGradient(
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            0,
            this.t5._scaleCoordinate(x),
            this.t5._scaleCoordinate(y),
            this.t5._scaleCoordinate(radius)
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.t5.strokeStyle = gradient;
    }

    dynamicGradient(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const ctx = this.t5.context;
        let gradient;

        if (type === 'linear') {
            gradient = ctx.createLinearGradient(
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                this.t5._scaleCoordinate(x2),
                this.t5._scaleCoordinate(y2)
            );
        } else if (type === 'radial') {
            gradient = ctx.createRadialGradient(
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                0,
                this.t5._scaleCoordinate(x1),
                this.t5._scaleCoordinate(y1),
                this.t5._scaleCoordinate(x2)
            );
        } else {
            throw new Error('Unsupported gradient type');
        }

        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        return gradient;
    }

    dynamicFill(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const gradient = this.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
        this.t5.fillStyle = gradient;
    }

    dynamicStroke(type, colorStops, x1, y1, x2, y2, r1 = 0, r2 = 0) {
        const gradient = this.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
        this.t5.strokeStyle = gradient;
    }
}

const myT5Draw = new T5Draw(myT5);

// Aliases for global scope
const noiseLine = (x, y, x2, y2, noiseScale, noiseStrength) => myT5Draw.noiseLine(x, y, x2, y2, noiseScale, noiseStrength);
const noiseEllipse = (x, y, width, height, noiseScale, noiseStrength) => myT5Draw.noiseEllipse(x, y, width, height, noiseScale, noiseStrength);
const noiseRect = (x, y, width, height, noiseScale, noiseStrength) => myT5Draw.noiseRect(x, y, width, height, noiseScale, noiseStrength);
const gradientFill = (color1, color2, x, y, x2, y2) => myT5Draw.gradientFill(color1, color2, x, y, x2, y2);
const gradientStroke = (color1, color2, x, y, x2, y2) => myT5Draw.gradientStroke(color1, color2, x, y, x2, y2);
const radialFill = (color1, color2, x, y, radius) => myT5Draw.radialFill(color1, color2, x, y, radius);
const radialStroke = (color1, color2, x, y, radius) => myT5Draw.radialStroke(color1, color2, x, y, radius);
const dynamicGradient = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicGradient(type, colorStops, x1, y1, x2, y2, r1, r2);
const dynamicFill = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicFill(type, colorStops, x1, y1, x2, y2, r1, r2);
const dynamicStroke = (type, colorStops, x1, y1, x2, y2, r1, r2) => myT5Draw.dynamicStroke(type, colorStops, x1, y1, x2, y2, r1, r2);
