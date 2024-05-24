# T5Element and T5Dom Documentation

## T5Element

### Overview
`T5Element` is a class that wraps around a DOM element and provides methods for manipulating it and handling events.

### Initialization
#### `constructor(element)`
Creates a new T5Element instance.
- **Arguments:**
  - `element` (HTMLElement): The DOM element to wrap.

### Methods

#### `parent(parent)`
Sets or gets the parent of the element.
- **Arguments:**
  - `parent` (string|T5Element|HTMLElement, optional): The parent element. If omitted, returns the current parent element.

#### `child(child)`
Sets or gets the children of the element.
- **Arguments:**
  - `child` (string|T5Element|HTMLElement, optional): The child element. If omitted, returns an array of T5Element instances representing the children.

#### `id(id)`
Sets or gets the ID of the element.
- **Arguments:**
  - `id` (string, optional): The ID to set. If omitted, returns the current ID.

#### `class(className)`
Sets or gets the class of the element.
- **Arguments:**
  - `className` (string, optional): The class to set. If omitted, returns the current class.

#### `addClass(className)`
Adds a class to the element.
- **Arguments:**
  - `className` (string): The class to add.

#### `removeClass(className)`
Removes a class from the element.
- **Arguments:**
  - `className` (string): The class to remove.

#### `hasClass(className)`
Checks if the element has a class.
- **Arguments:**
  - `className` (string): The class to check.

#### `toggleClass(className)`
Toggles a class on the element.
- **Arguments:**
  - `className` (string): The class to toggle.

#### `position(x, y, positionType = 'absolute')`
Sets or gets the position of the element.
- **Arguments:**
  - `x` (number, optional): The x-coordinate. If omitted, returns the current position.
  - `y` (number, optional): The y-coordinate. If omitted, returns the current position.
  - `positionType` (string, optional): The CSS position type. Default is 'absolute'.

#### `size(width, height)`
Sets or gets the size of the element.
- **Arguments:**
  - `width` (number, optional): The width. If omitted, returns the current size.
  - `height` (number, optional): The height. If omitted, returns the current size.

#### `center(align = 'both')`
Centers the element within its parent.
- **Arguments:**
  - `align` (string, optional): Alignment type ('both', 'horizontal', 'vertical'). Default is 'both'.

#### `html(content, append = false)`
Sets or gets the inner HTML of the element.
- **Arguments:**
  - `content` (string, optional): The HTML content to set. If omitted, returns the current inner HTML.
  - `append` (boolean, optional): Whether to append the content. Default is false.

#### `style(property, value)`
Sets or gets a CSS property of the element.
- **Arguments:**
  - `property` (string): The CSS property.
  - `value` (string, optional): The value to set. If omitted, returns the current value.

#### `attribute(attr, value)`
Sets or gets an attribute of the element.
- **Arguments:**
  - `attr` (string): The attribute.
  - `value` (string, optional): The value to set. If omitted, returns the current value.

#### `removeAttribute(attr)`
Removes an attribute from the element.
- **Arguments:**
  - `attr` (string): The attribute to remove.

#### `value(value)`
Sets or gets the value of the element.
- **Arguments:**
  - `value` (string, optional): The value to set. If omitted, returns the current value.

#### `show()`
Shows the element.

#### `hide()`
Hides the element.

## T5Dom

### Overview
`T5Dom` is a class that provides utility methods for creating and selecting DOM elements.

### Initialization
#### `constructor()`
Creates a new T5Dom instance.

### Methods

#### `select(selector)`
Selects a single element matching the selector.
- **Arguments:**
  - `selector` (string): The CSS selector.

#### `selectAll(selector)`
Selects all elements matching the selector.
- **Arguments:**
  - `selector` (string): The CSS selector.

#### `removeElements()`
Removes all elements created by the T5Dom instance.

#### `createElement(tag, html = '')`
Creates a new element.
- **Arguments:**
  - `tag` (string): The tag name of the element.
  - `html` (string, optional): The inner HTML of the element.

#### `createDiv(html = '')`
Creates a new `div` element.
- **Arguments:**
  - `html` (string, optional): The inner HTML of the `div`.

#### `createP(html = '')`
Creates a new `p` element.
- **Arguments:**
  - `html` (string, optional): The inner HTML of the `p`.

#### `createSpan(html = '')`
Creates a new `span` element.
- **Arguments:**
  - `html` (string, optional): The inner HTML of the `span`.

#### `createImg(src, alt = '')`
Creates a new `img` element.
- **Arguments:**
  - `src` (string): The source URL of the image.
  - `alt` (string, optional): The alt text of the image.

#### `createA(href, html = '')`
Creates a new `a` element.
- **Arguments:**
  - `href` (string): The href attribute of the link.
  - `html` (string, optional): The inner HTML of the `a`.

#### `createSlider(min, max, value, step)`
Creates a new `input[type=range]` element.
- **Arguments:**
  - `min` (number): The minimum value.
  - `max` (number): The maximum value.
  - `value` (number): The initial value.
  - `step` (number): The step value.

#### `createButton(label, callback)`
Creates a new `button` element.
- **Arguments:**
  - `label` (string): The button label.
  - `callback` (function): The callback function for the 'click' event.

#### `createCheckbox(label, checked)`
Creates a new `input[type=checkbox]` element.
- **Arguments:**
  - `label` (string): The label text.
  - `checked` (boolean): Whether the checkbox is checked.

#### `createSelect(options)`
Creates a new `select` element.
- **Arguments:**
  - `options` (array): The options for the select element.

#### `createRadio(name, options)`
Creates a new radio button group.
- **Arguments:**
  - `name` (string): The name attribute for the radio buttons.
  - `options` (array): The options for the radio buttons.

#### `createColorPicker(value = '#000000')`
Creates a new `input[type=color]` element.
- **Arguments:**
  - `value` (string, optional): The initial color value. Default is '#000000'.

#### `createInput(value = '', type = 'text')`
Creates a new `input` element.
- **Arguments:**
  - `value` (string, optional): The initial value.
  - `type` (string, optional): The input type. Default is 'text'.

#### `createFileInput(callback)`
Creates a new `input[type=file]` element.
- **Arguments:**
  - `callback` (function): The callback function for the 'change' event.

#### `createVideo(src)`
Creates a new `video` element.
- **Arguments:**
  - `src` (string): The source URL of the video.

#### `createAudio(src)`
Creates a new `audio` element.
- **Arguments:**
  - `src` (string): The source URL of the audio.

#### `createCapture()`
Creates a new `video` element for capturing video from the user's webcam.

## Aliases

### DOM functions for global scope
- `select(selector)`: Alias for `myT5Dom.select(selector)`
- `selectAll(selector)`: Alias for `myT5Dom.selectAll(selector)`
- `removeElements()`: Alias for `myT5Dom.removeElements()`
- `createDiv(html)`: Alias for `myT5Dom.createDiv(html)`
- `createP(html)`: Alias for `myT5Dom.createP(html)`
- `createSpan(html)`: Alias for `myT5Dom.createSpan(html)`
- `createImg(src, alt)`: Alias for `myT5Dom.createImg(src, alt)`
- `createA(href, html)`: Alias for `myT5Dom.createA(href, html)`
- `createSlider(min, max, value, step)`: Alias for `myT5Dom.createSlider(min, max, value, step)`
- `createButton(label, callback)`: Alias for `myT5Dom.createButton(label, callback)`
- `createCheckbox(label, checked)`: Alias for `myT5Dom.createCheckbox(label, checked)`
- `createSelect(options)`: Alias for `myT5Dom.createSelect(options)`
- `createRadio(name, options)`: Alias for `myT5Dom.createRadio(name, options)`
- `createColorPicker(value)`: Alias for `myT5Dom.createColorPicker(value)`
- `createInput(value, type)`: Alias for `myT5Dom.createInput(value, type)`
- `createFileInput(callback)`: Alias for `myT5Dom.createFileInput(callback)`
- `createVideo(src)`: Alias for `myT5Dom.createVideo(src)`
- `createAudio(src)`: Alias for `myT5Dom.createAudio(src)`
- `createCapture()`: Alias for `myT5Dom.createCapture()`
- `createElement(tag, html)`: Alias for `myT
