# T5Text Documentation

## Overview
`T5Text` is a class that manages text rendering on a T5 canvas. It provides methods for setting text properties and drawing text.

## Initialization
### `constructor(baseT5)`
Creates a new T5Text instance.
- **Arguments:**
  - `baseT5` (object): The T5 canvas instance to associate with this text manager.

## Methods

### `textSize(size)`
Sets the text size.
- **Arguments:**
  - `size` (number): The text size.

### `textFont(font)`
Sets the text font.
- **Arguments:**
  - `font` (string): The font family.

### `textAlign(horizAlign, vertAlign = 'alphabetic')`
Sets the text alignment.
- **Arguments:**
  - `horizAlign` (string): The horizontal alignment ('left', 'right', 'center', 'start', 'end').
  - `vertAlign` (string, optional): The vertical alignment ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'). Default is 'alphabetic'.

### `textLeading(leading)`
Sets the text leading (line height).
- **Arguments:**
  - `leading` (number): The line height.

### `textStyle(style)`
Sets the text style.
- **Arguments:**
  - `style` (string): The text style ('normal', 'italic', 'oblique').

### `textWrap(wrap)`
Sets the text wrapping mode.
- **Arguments:**
  - `wrap` (string): The wrapping mode ('word', 'char').

### `letterSpacing(spacing)`
Sets the letter spacing.
- **Arguments:**
  - `spacing` (number): The letter spacing.

### `textWidth(text)`
Gets the width of the specified text.
- **Arguments:**
  - `text` (string): The text to measure.

### `textAscent()`
Gets the ascent of the text.

### `textDescent()`
Gets the descent of the text.

### `loadFont(path, callback)`
Loads a font from a specified path.
- **Arguments:**
  - `path` (string): The path to the font file.
  - `callback` (function, optional): The callback function to execute after the font is loaded.

### `text(text, x, y)`
Draws text at the specified position.
- **Arguments:**
  - `text` (string): The text to draw.
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.

### `multilineText(text, x, y, maxWidth)`
Draws multiline text within the specified width.
- **Arguments:**
  - `text` (string): The text to draw.
  - `x` (number): The x-coordinate.
  - `y` (number): The y-coordinate.
  - `maxWidth` (number): The maximum width for the text.

## Aliases

### Global functions
- `textSize(size)`: Alias for `myT5Text.textSize(size)`
- `textFont(font)`: Alias for `myT5Text.textFont(font)`
- `textAlign(horizAlign, vertAlign)`: Alias for `myT5Text.textAlign(horizAlign, vertAlign)`
- `text(content, x, y)`: Alias for `myT5Text.text(content, x, y)`
- `textWidth(content)`: Alias for `myT5Text.textWidth(content)`
- `textLeading(leading)`: Alias for `myT5Text.textLeading(leading)`
- `textStyle(style)`: Alias for `myT5Text.textStyle(style)`
- `textAscent()`: Alias for `myT5Text.textAscent()`
- `textDescent()`: Alias for `myT5Text.textDescent()`
- `textWrap(wrap)`: Alias for `myT5Text.textWrap(wrap)`
- `letterSpacing(spacing)`: Alias for `myT5Text.letterSpacing(spacing)`
- `loadFont(path, callback)`: Alias for `myT5Text.loadFont(path, callback)`
- `multilineText(content, x, y, maxWidth)`: Alias for `myT5Text.multilineText(content, x, y, maxWidth)`

### Horizontal alignment (textAlign)
- 'left' (default)
- 'right'
- 'center'
- 'start'
- 'end'

### Vertical alignment (textBaseline)
- 'top'
- 'hanging'
- 'middle'
- 'alphabetic' (default)
- 'ideographic'
- 'bottom'
