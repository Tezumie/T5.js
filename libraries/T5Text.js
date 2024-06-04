//************************************************************************//
//********************************-T5Text-********************************//
//************************************************************************//

class T5Text {
    constructor(baseT5) {
        this.baseT5 = baseT5;
        this.baseT5.textSize = 16;
        this.baseT5.textFont = 'Arial, sans-serif'; // Arial for better emoji support
        this.baseT5.textAlign = 'left';
        this.baseT5.textBaseline = 'alphabetic';
        this.baseT5.textLeading = 1.2;
        this.baseT5.textStyle = 'normal';
        this.baseT5.textWrap = 'word';
        this.baseT5.letterSpacing = 0;
    }

    textSize(size) {
        this.baseT5.textSize = size;
    }

    textFont(font) {
        this.baseT5.textFont = font;
    }

    textAlign(horizAlign, vertAlign = 'alphabetic') {
        this.baseT5.textAlign = horizAlign;
        this.baseT5.textBaseline = vertAlign;
    }

    textLeading(leading) {
        this.baseT5.textLeading = leading;
    }

    textStyle(style) {
        this.baseT5.textStyle = style;
    }

    textWrap(wrap) {
        this.baseT5.textWrap = wrap;
    }

    letterSpacing(spacing) {
        this.baseT5.letterSpacing = spacing;
    }

    textWidth(text) {
        const ctx = this.baseT5.context
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            const spacing = this.baseT5._scaleCoordinate(this.baseT5.letterSpacing);
            let width = 0;
            for (let i = 0; i < text.length; i++) {
                width += ctx.measureText(text[i]).width + spacing;
            }
            return width - spacing;
        }
        return 0;
    }

    textAscent() {
        const ctx = this.baseT5.context
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            return ctx.measureText('M').actualBoundingBoxAscent;
        }
        return 0;
    }

    textDescent() {
        const ctx = this.baseT5.context
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            return ctx.measureText('g').actualBoundingBoxDescent;
        }
        return 0;
    }

    loadFont(path, callback) {
        const font = new FontFace('customFont', `url(${path})`);
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            if (callback) callback(loadedFont);
        }).catch((error) => {
            console.error('Error loading font:', error);
            if (callback) callback(null);
        });
    }

    text(text, x, y) {
        const ctx = this.baseT5.context
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            ctx.textAlign = this.baseT5.textAlign;
            ctx.textBaseline = this.baseT5.textBaseline;
            ctx.fillStyle = this.baseT5.fillStyle;
            ctx.strokeStyle = this.baseT5.strokeStyle;

            const scaledX = this.baseT5._scaleCoordinate(x);
            const scaledY = this.baseT5._scaleCoordinate(y);

            if (this.baseT5.fillStyle) {
                ctx.fillText(text, scaledX, scaledY);
            }
            if (this.baseT5.strokeStyle) {
                ctx.lineWidth = this.baseT5.strokeWidth;
                ctx.strokeText(text, scaledX, scaledY);
            }
        }
    }

    multilineText(text, x, y, maxWidth) {
        const ctx = this.baseT5.context
        if (ctx) {
            ctx.font = `${this.baseT5.textStyle} ${this.baseT5._scaleCoordinate(this.baseT5.textSize)}px ${this.baseT5.textFont}`;
            ctx.textAlign = this.baseT5.textAlign;
            ctx.textBaseline = this.baseT5.textBaseline;
            ctx.fillStyle = this.baseT5.fillStyle;
            ctx.strokeStyle = this.baseT5.strokeStyle;
            const spacing = this.baseT5._scaleCoordinate(this.baseT5.letterSpacing);

            const lines = this._wrapText(ctx, text, this.baseT5._scaleCoordinate(maxWidth));
            let lineHeight = this.baseT5._scaleCoordinate(this.baseT5.textSize) * this.baseT5.textLeading;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let currentY = y + i * lineHeight;
                let currentX = this.baseT5._scaleCoordinate(x);
                for (let j = 0; j < line.length; j++) {
                    if (this.baseT5.fillStyle) {
                        ctx.fillText(line[j], currentX, this.baseT5._scaleCoordinate(currentY));
                    }
                    if (this.baseT5.strokeStyle) {
                        ctx.lineWidth = this.baseT5.strokeWidth;
                        ctx.strokeText(line[j], currentX, this.baseT5._scaleCoordinate(currentY));
                    }
                    currentX += ctx.measureText(line[j]).width + spacing;
                }
            }
        }
    }

    _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

//T5Text instance link to T5 instance
const myT5Text = new T5Text(myT5);

// Alias text functions for global scope
const textSize = (size) => myT5Text.textSize(size);
const textFont = (font) => myT5Text.textFont(font);
const textAlign = (horizAlign, vertAlign) => myT5Text.textAlign(horizAlign, vertAlign);
const text = (content, x, y) => myT5Text.text(content, x, y);
const textWidth = (content) => myT5Text.textWidth(content);
const textLeading = (leading) => myT5Text.textLeading(leading);
const textLineHeight = (height) => myT5Text.textLineHeight(height);
const textStyle = (style) => myT5Text.textStyle(style);
const textAscent = () => myT5Text.textAscent();
const textDescent = () => myT5Text.textDescent();
const textWrap = (wrap) => myT5Text.textWrap(wrap);
const letterSpacing = (spacing) => myT5Text.letterSpacing(spacing);
const loadFont = (path, callback) => myT5Text.loadFont(path, callback);
const multilineText = (content, x, y, maxWidth) => myT5Text.multilineText(content, x, y, maxWidth);

// Font styles
const NORMAL = 'normal';
const ITALIC = 'italic';
const BOLD = 'bold';
const BOLDITALIC = 'italic bold';
const LIGHT = 'light';
const UNDERLINE = 'underline';
const STRIKETHROUGH = 'line-through';
// Text alignment
const CENTER = 'center';
const LEFT = 'left';
const RIGHT = 'right';
const TOP = 'top';
const BOTTOM = 'bottom';
const BASELINE = 'alphabetic';
const MIDDLE = 'middle';
const HANGING = 'hanging';
const IDEOGRAPHIC = 'ideographic';

// Horizontal alignment (textAlign):
//     'left' (default)
//     'right'
//     'center'
//     'start'
//     'end'

// Vertical alignment (textBaseline):
//     'top'
//     'hanging'
//     'middle'
//     'alphabetic' (default)
//     'ideographic'
//     'bottom'