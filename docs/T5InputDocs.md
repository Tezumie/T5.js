# T5Input Documentation

## Overview
`T5Input` is a class that manages keyboard and mouse input events for a T5 canvas. It provides properties and methods to interact with and respond to user input.

## Initialization
### `constructor(baseT5)`
Creates a new T5Input instance.
- **Arguments:**
  - `baseT5` (object): The T5 canvas instance to associate with this input manager.

## Methods

### `_initEventListeners()`
Initializes the event listeners for keyboard and mouse events.

### `_keyPressed(e)`
Handles the 'keydown' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_keyReleased(e)`
Handles the 'keyup' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_keyTyped(e)`
Handles the 'keypress' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_onmousemove(e)`
Handles the 'mousemove' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_onmousedown(e)`
Handles the 'mousedown' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_onmouseup(e)`
Handles the 'mouseup' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_onclick(e)`
Handles the 'click' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_doubleClicked(e)`
Handles the 'dblclick' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_mouseWheel(e)`
Handles the 'wheel' event.
- **Arguments:**
  - `e` (Event): The event object.

### `_updateMouse(e)`
Updates the mouse position properties.
- **Arguments:**
  - `e` (Event): The event object.

### `keyIsDown(keyCode)`
Checks if a specific key is currently pressed.
- **Arguments:**
  - `keyCode` (number): The key code to check.

### `requestPointerLock()`
Requests pointer lock for the canvas.

### `exitPointerLock()`
Exits pointer lock.

### `cursor(type = 'default', x = 0, y = 0)`
Sets the cursor style for the canvas.
- **Arguments:**
  - `type` (string, optional): The cursor style. Default is 'default'.
  - `x` (number, optional): The x-coordinate for custom cursor. Default is 0.
  - `y` (number, optional): The y-coordinate for custom cursor. Default is 0.

### `noCursor()`
Hides the cursor.

## Properties

### `mouseX`
Gets the current x-coordinate of the mouse relative to the canvas.

### `mouseY`
Gets the current y-coordinate of the mouse relative to the canvas.

### `pmouseX`
Gets the previous x-coordinate of the mouse relative to the canvas.

### `pmouseY`
Gets the previous y-coordinate of the mouse relative to the canvas.

### `winMouseX`
Gets the current x-coordinate of the mouse relative to the window.

### `winMouseY`
Gets the current y-coordinate of the mouse relative to the window.

### `pwinMouseX`
Gets the previous x-coordinate of the mouse relative to the window.

### `pwinMouseY`
Gets the previous y-coordinate of the mouse relative to the window.

### `mouseButton`
Gets the current mouse button pressed ('left', 'middle', 'right').

### `mouseIsPressed`
Checks if any mouse button is currently pressed.

### `keyIsPressed`
Checks if any key is currently pressed.

### `key`
Gets the current key pressed.

### `keyCode`
Gets the keyCode of the current key pressed.

## Aliases

### Global properties
- `mouseX`: Alias for `myT5Input.mouseX`
- `mouseY`: Alias for `myT5Input.mouseY`
- `pmouseX`: Alias for `myT5Input.pmouseX`
- `pmouseY`: Alias for `myT5Input.pmouseY`
- `winMouseX`: Alias for `myT5Input.winMouseX`
- `winMouseY`: Alias for `myT5Input.winMouseY`
- `pwinMouseX`: Alias for `myT5Input.pwinMouseX`
- `pwinMouseY`: Alias for `myT5Input.pwinMouseY`
- `mouseButton`: Alias for `myT5Input.mouseButton`
- `mouseIsPressed`: Alias for `myT5Input.mouseIsPressed`

### Global functions
- `keyIsPressed()`: Alias for `myT5Input.keyIsPressed`
- `key()`: Alias for `myT5Input.key`
- `keyIsDown(code)`: Alias for `myT5Input.keyIsDown(code)`
- `movedX()`: Alias for `myT5Input.movedX`
- `movedY()`: Alias for `myT5Input.movedY`
- `requestPointerLock()`: Alias for `myT5Input.requestPointerLock`
- `exitPointerLock()`: Alias for `myT5Input.exitPointerLock`
- `cursor(type, x, y)`: Alias for `myT5Input.cursor(type, x, y)`
- `noCursor()`: Alias for `myT5Input.noCursor`
