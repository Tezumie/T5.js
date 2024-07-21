//************************************************************************//
//********************************-T5Text-********************************//
//************************************************************************//
T5.addOns.text = ($, p) => {
  // Constants
  $.defineConstant('NORMAL', 'normal');
  $.defineConstant('ITALIC', 'italic');
  $.defineConstant('BOLD', 'bold');
  $.defineConstant('BOLDITALIC', 'italic bold');
  $.defineConstant('CENTER', 'center');
  $.defineConstant('MIDDLE', 'middle');
  $.defineConstant('LEFT', 'left');
  $.defineConstant('RIGHT', 'right');
  $.defineConstant('TOP', 'top');
  $.defineConstant('BOTTOM', 'bottom');
  $.defineConstant('BASELINE', 'alphabetic');
  $.defineConstant('WORD', 'word');
  $.defineConstant('CHAR', 'char');
  $.defineConstant('WRAP', 'wrap');
  $.defineConstant('NOWRAP', 'nowrap');

  // Default text properties
  $.textSizeVal = 12;
  $.textAlignH = 'left';
  $.textAlignV = 'alphabetic'; // Default to baseline for vertical alignment
  $.textLeadingVal = $.textSizeVal * 1.2;
  $.textFontVal = 'sans-serif';
  $.textStyleVal = 'normal';
  $.textWrapVal = 'wrap';
  $.textFillColor = '#000000';
  $.textStrokeColor = '#000000';

  // Set text size
  $.textSize = function (size) {
    [size] = $.scaleT5Coords([size]);
    if (size !== undefined) {
      $.textSizeVal = size;
      $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
    }
    return $.textSizeVal;
  };

  // Set text font
  $.textFont = function (font) {
    if (font instanceof T5Font) {
      font = font.family;
    }
    if (font !== undefined) {
      $.textFontVal = font;
      $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
    }
    return $.textFontVal;
  };

  // Set text style (normal, bold, italic)
  $.textStyle = function (style) {
    if (style !== undefined) {
      $.textStyleVal = style;
      $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
    }
    return $.textStyleVal;
  };

  // Set text alignment
  $.textAlign = function (hAlign, vAlign) {
    if (hAlign !== undefined) {
      $.textAlignH = hAlign;
    }
    if (vAlign !== undefined) {
      $.textAlignV = vAlign;
    }
    $.context.textAlign = $.textAlignH;
    $.context.textBaseline = $.textAlignV;
  };

  // Set text leading (line height)
  $.textLeading = function (leading) {
    [leading] = $.scaleT5Coords([leading]);
    if (leading !== undefined) {
      $.textLeadingVal = leading;
    }
    return $.textLeadingVal;
  };

  // Set text wrap
  $.textWrap = function (wrapType) {
    if (wrapType !== undefined) {
      $.textWrapVal = wrapType;
    }
    return $.textWrapVal;
  };

  // Measure text width
  $.textWidth = function (str) {
    return $.context.measureText(str).width;
  };

  // Measure text ascent
  $.textAscent = function () {
    $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
    return $.context.measureText("M").actualBoundingBoxAscent;
  };

  // Measure text descent
  $.textDescent = function () {
    $.context.font = `${$.textStyleVal} ${$.textSizeVal}px ${$.textFontVal}`;
    return $.context.measureText("g").actualBoundingBoxDescent;
  };

  // Draw text
  $.text = function (str, x, y, maxWidth) {
    [x, y] = $.scaleT5Coords([x, y]);
    const lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if ($.textWrapVal === 'wrap' && maxWidth !== undefined) {
        $.drawWrappedText(lines[i], x, y + i * $.textLeadingVal, maxWidth);
      } else {
        if ($.context.fillStyle) {
          $.context.fillText(lines[i], x, y + i * $.textLeadingVal);
        }
        if ($.context.strokeStyle) {
          $.context.strokeText(lines[i], x, y + i * $.textLeadingVal);
        }
      }
    }
  };

  // Draw wrapped text
  $.drawWrappedText = function (text, x, y, maxWidth) {
    let words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = $.context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        if ($.context.fillStyle) {
          $.context.fillText(line, x, y);
        }
        if ($.context.strokeStyle) {
          $.context.strokeText(line, x, y);
        }
        line = words[i] + ' ';
        y += $.textLeadingVal;
      } else {
        line = testLine;
      }
    }
    if ($.context.fillStyle) {
      $.context.fillText(line, x, y);
    }
    if ($.context.strokeStyle) {
      $.context.strokeText(line, x, y);
    }
  };

  // Font class
  class T5Font {
    constructor(font, family) {
      this.font = font;
      this.family = family;
    }
  }

  // Load font
  $.loadFont = function (path, callback) {
    window.t5PreloadCount++;
    const family = 'CustomFont' + window.t5PreloadCount;
    const font = new FontFace(family, `url(${path})`);
    const t5Font = new T5Font(font, family);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      window.t5PreloadDone++;
      if (callback) {
        callback(t5Font);
      }
    }).catch((error) => {
      window.t5PreloadDone++;
      console.error(`Failed to load font at path: ${path}. Error: ${error}`);
    });
    return t5Font;
  };

};

// Apply the text module
T5.addOns.text(T5.prototype, T5.prototype);
