//*************************************************************************//
//********************************-T5Input-********************************//
//*************************************************************************//

class T5Input {
    constructor(baseT5) {
        this.baseT5 = baseT5;
        this.keyIsPressed = false;
        this.key = '';
        this.keyCode = 0;
        this.mouseButton = '';
        this.mouseIsPressed = false;
        this.movedX = 0;
        this.movedY = 0;
        this._mouseX = 0;
        this._mouseY = 0;
        this._pmouseX = 0;
        this._pmouseY = 0;
        this._winMouseX = 0;
        this._winMouseY = 0;
        this._pwinMouseX = 0;
        this._pwinMouseY = 0;
        this._initEventListeners();
    }

    _initEventListeners() {
        document.addEventListener('keydown', (e) => this._keyPressed(e));
        document.addEventListener('keyup', (e) => this._keyReleased(e));
        document.addEventListener('keypress', (e) => this._keyTyped(e));
        document.addEventListener('mousemove', (e) => this._onmousemove(e));
        document.addEventListener('mousedown', (e) => this._onmousedown(e));
        document.addEventListener('mouseup', (e) => this._onmouseup(e));
        document.addEventListener('click', (e) => this._onclick(e));
        document.addEventListener('dblclick', (e) => this._doubleClicked(e));
        document.addEventListener('wheel', (e) => this._mouseWheel(e));
    }

    _keyPressed(e) {
        this.keyIsPressed = true;
        this.key = e.key;
        this.keyCode = e.keyCode;
        if (typeof window.keyPressed === 'function') {
            window.keyPressed(e);
        }
    }

    _keyReleased(e) {
        this.keyIsPressed = false;
        this.key = '';
        if (typeof window.keyReleased === 'function') {
            window.keyReleased(e);
        }
        this.keyCode = 0;
    }

    _keyTyped(e) {
        if (typeof window.keyTyped === 'function') {
            window.keyTyped(e);
        }
    }

    _onmousemove(e) {
        this._updateMouse(e);
        if (this.mouseIsPressed) {
            if (typeof window.mouseDragged === 'function') {
                window.mouseDragged(e);
            }
        } else {
            if (typeof window.mouseMoved === 'function') {
                window.mouseMoved(e);
            }
        }
    }

    _onmousedown(e) {
        this._updateMouse(e);
        this.mouseIsPressed = true;
        this.mouseButton = ['left', 'middle', 'right'][e.button];
        if (typeof window.mousePressed === 'function') {
            window.mousePressed(e);
        }
    }

    _onmouseup(e) {
        this._updateMouse(e);
        this.mouseIsPressed = false;
        if (typeof window.mouseReleased === 'function') {
            window.mouseReleased(e);
        }
    }

    _onclick(e) {
        this._updateMouse(e);
        this.mouseIsPressed = true;
        if (typeof window.mouseClicked === 'function') {
            window.mouseClicked(e);
        }
        this.mouseIsPressed = false;
    }

    _doubleClicked(e) {
        if (typeof window.doubleClicked === 'function') {
            window.doubleClicked(e);
        }
    }

    _mouseWheel(e) {
        if (typeof window.mouseWheel === 'function') {
            window.mouseWheel(e);
        }
    }

    _updateMouse(e) {
        if (e.changedTouches) return;
        const rect = this.baseT5.canvas.getBoundingClientRect();
        const canvasWidth = this.baseT5.canvas.width / this.baseT5.pixelDensityValue;
        const canvasHeight = this.baseT5.canvas.height / this.baseT5.pixelDensityValue;

        let displayedWidth, displayedHeight;
        const aspectRatioCanvas = canvasWidth / canvasHeight;
        const aspectRatioRect = rect.width / rect.height;

        if (aspectRatioCanvas > aspectRatioRect) {
            displayedWidth = rect.width;
            displayedHeight = rect.width / aspectRatioCanvas;
        } else {
            displayedWidth = rect.height * aspectRatioCanvas;
            displayedHeight = rect.height;
        }

        const offsetX = (rect.width - displayedWidth) / 2;
        const offsetY = (rect.height - displayedHeight) / 2;

        const sx = canvasWidth / displayedWidth;
        const sy = canvasHeight / displayedHeight;

        this._pmouseX = this._mouseX;
        this._pmouseY = this._mouseY;
        this._mouseX = (e.clientX - rect.left - offsetX) * sx;
        this._mouseY = (e.clientY - rect.top - offsetY) * sy;

        this._pwinMouseX = this._winMouseX;
        this._pwinMouseY = this._winMouseY;
        this._winMouseX = e.clientX;
        this._winMouseY = e.clientY;
    }

    keyIsDown(keyCode) {
        return this.keyIsPressed && this.keyCode === keyCode;
    }

    requestPointerLock() {
        if (this.baseT5.canvas) {
            this.baseT5.canvas.requestPointerLock();
        }
    }

    exitPointerLock() {
        document.exitPointerLock();
    }

    cursor(type = 'default', x = 0, y = 0) {
        const canvas = this.baseT5.canvas;
        const types = {
            ARROW: 'default',
            CROSS: 'crosshair',
            HAND: 'pointer',
            MOVE: 'move',
            TEXT: 'text',
            WAIT: 'wait'
        };

        if (types[type]) {
            canvas.style.cursor = types[type];
        } else if (type.startsWith('url(') || /\.(cur|gif|jpg|jpeg|png)$/.test(type)) {
            canvas.style.cursor = `url(${type}) ${x} ${y}, auto`;
        } else {
            canvas.style.cursor = type;
        }
    }

    noCursor() {
        const canvas = this.baseT5.canvas;
        canvas.style.cursor = 'none';
    }

    get mouseX() {
        return this._scaleCoordinate(this._mouseX);
    }

    get mouseY() {
        return this._scaleCoordinate(this._mouseY);
    }

    get pmouseX() {
        return this._scaleCoordinate(this._pmouseX);
    }

    get pmouseY() {
        return this._scaleCoordinate(this._pmouseY);
    }

    get winMouseX() {
        return this._scaleCoordinate(this._winMouseX);
    }

    get winMouseY() {
        return this._scaleCoordinate(this._winMouseY);
    }

    get pwinMouseX() {
        return this._scaleCoordinate(this._pwinMouseX);
    }

    get pwinMouseY() {
        return this._scaleCoordinate(this._pwinMouseY);
    }

    _scaleCoordinate(coord) {
        if (this.baseT5.dimensionAgnosticMode) {
            return (coord / this.baseT5.canvas.width * this.baseT5.pixelDensityValue) * this.baseT5.dimensionUnit;
        }
        return coord;
    }
}

const myT5Input = new T5Input(myT5);

const properties = [
    'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'winMouseX', 'winMouseY', 'pwinMouseX', 'pwinMouseY',
    'mouseButton', 'mouseIsPressed'
];

properties.forEach(prop => {
    Object.defineProperty(window, prop, {
        get: function () {
            return myT5Input[prop];
        }
    });
});

// Alias input functions for global scope
const keyIsPressed = () => myT5Input.keyIsPressed;
const key = () => myT5Input.key;
Object.defineProperty(window, 'keyCode', {
    get: function () {
        return myT5Input.keyCode;
    }
});
const keyIsDown = (code) => myT5Input.keyIsDown(code);
const movedX = () => myT5Input.movedX;
const movedY = () => myT5Input.movedY;
const requestPointerLock = () => myT5Input.requestPointerLock();
const exitPointerLock = () => myT5Input.exitPointerLock();
const cursor = (type, x, y) => myT5Input.cursor(type, x, y);
const noCursor = () => myT5Input.noCursor();
