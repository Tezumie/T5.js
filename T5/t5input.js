//************************************************************************//
//*******************************-T5Input-********************************//
//************************************************************************//
T5.addOns.input = ($, p, globalScope) => {
    globalScope = $
    $.defineConstant('UP_ARROW', 38);
    $.defineConstant('DOWN_ARROW', 40);
    $.defineConstant('LEFT_ARROW', 37);
    $.defineConstant('RIGHT_ARROW', 39);
    $.defineConstant('SHIFT', 16);
    $.defineConstant('TAB', 9);
    $.defineConstant('BACKSPACE', 8);
    $.defineConstant('ENTER', 13);
    $.defineConstant('RETURN', 13);
    $.defineConstant('ALT', 18);
    $.defineConstant('OPTION', 18);
    $.defineConstant('CONTROL', 17);
    $.defineConstant('DELETE', 46);
    $.defineConstant('ESCAPE', 27);

    $.defineConstant('ARROW', 'default');
    $.defineConstant('CROSS', 'crosshair');
    $.defineConstant('HAND', 'pointer');
    $.defineConstant('MOVE', 'move');
    $.defineConstant('TEXT', 'text');

    class T5Input {
        constructor() {
            this.keysPressed = new Set();
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
            // this._initEventListeners();
        }

        _initEventListeners() {
            if (!$.initEventListenersActive) {
                $.initEventListenersActive = true
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
        }

        _keyPressed(e) {
            this.keysPressed.add(e.keyCode);
            this.keyIsPressed = true;
            this.key = e.key;
            this.keyCode = e.keyCode;
            if (typeof window.keyPressed === 'function') {
                window.keyPressed(e);
            }
        }

        _keyReleased(e) {
            this.keysPressed.delete(e.keyCode);
            this.keyIsPressed = this.keysPressed.size > 0;
            this.key = e.key;
            this.keyCode = e.keyCode;

            if (typeof window.keyReleased === 'function') {
                window.keyReleased(e);
            }
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

        _calculateCanvasMetrics() {
            if (!$) { return }
            const { canvas } = $;
            if (!canvas) { return }
            const rect = canvas.getBoundingClientRect();
            const aspectRatioCanvas = canvas.width / canvas.height;
            const aspectRatioRect = rect.width / rect.height;

            const isCanvasWider = aspectRatioCanvas > aspectRatioRect;
            const displayedWidth = isCanvasWider ? rect.width : rect.height * aspectRatioCanvas;
            const displayedHeight = isCanvasWider ? rect.width / aspectRatioCanvas : rect.height;

            this.canvasMetrics = {
                offsetX: (rect.width - displayedWidth) / 2,
                offsetY: (rect.height - displayedHeight) / 2,
                scaleX: canvas.width / displayedWidth,
                scaleY: canvas.height / displayedHeight,
                rect,
                width: window.innerWidth,
                height: window.innerHeight
            };
        }

        _updateMouse(e) {
            if (e.changedTouches) return;

            const { canvasMetrics } = this;
            if (!canvasMetrics || window.innerWidth !== canvasMetrics.width || window.innerHeight !== canvasMetrics.height) {
                this._calculateCanvasMetrics();
            }
            if (!this.canvasMetrics) { return }
            const { offsetX, offsetY, scaleX, scaleY, rect } = this.canvasMetrics;
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            this._pmouseX = this._mouseX;
            this._pmouseY = this._mouseY;
            this._mouseX = (e.clientX - rect.left - offsetX + scrollX) * scaleX;
            this._mouseY = (e.clientY - rect.top - offsetY + scrollY) * scaleY;
            this._pwinMouseX = this._winMouseX;
            this._pwinMouseY = this._winMouseY;
            this._winMouseX = e.clientX + scrollX;
            this._winMouseY = e.clientY + scrollY;
        }

        keyIsDown(keyCode) {
            return this.keysPressed.has(keyCode);
        }

        requestPointerLock() {
            if ($.canvas) {
                $.canvas.requestPointerLock();
            }
        }

        exitPointerLock() {
            document.exitPointerLock();
        }

        cursor(type = 'default', x = 0, y = 0) {
            const canvas = $.canvas;
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
            const canvas = $.canvas;
            canvas.style.cursor = 'none';
        }

        get mouseX() {
            return $.scaleT5Mouse(this._mouseX);
        }

        get mouseY() {
            return $.scaleT5Mouse(this._mouseY);
        }

        get pmouseX() {
            return this._pmouseX;
        }

        get pmouseY() {
            return this._pmouseY;
        }

        get winMouseX() {
            return $.scaleT5Mouse(this._winMouseX);
        }

        get winMouseY() {
            return $.scaleT5Mouse(this._winMouseY);
        }

        get pwinMouseX() {
            return this._pwinMouseX;
        }

        get pwinMouseY() {
            return this._pwinMouseY;
        }

    }

    const t5Input = new T5Input();
    t5Input._initEventListeners();

    const properties = [
        'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'winMouseX', 'winMouseY', 'pwinMouseX', 'pwinMouseY',
        'mouseButton', 'mouseIsPressed'
    ];

    properties.forEach(prop => {
        if (!(prop in window)) {
            Object.defineProperty(window, prop, {
                get: function () {
                    return t5Input[prop];
                }
            });
        }
    });

    if (!('keyIsPressed' in window)) {
        Object.defineProperty(window, 'keyIsPressed', {
            get: function () {
                return t5Input.keyIsPressed;
            }
        });
    }
    if (!('key' in window)) {
        Object.defineProperty(window, 'key', {
            get: function () {
                return t5Input.key;
            }
        });
    }
    if (!('keyCode' in window)) {
        Object.defineProperty(window, 'keyCode', {
            get: function () {
                return t5Input.keyCode;
            }
        });
    }
    if (!('keyIsDown' in window)) {
        globalScope.keyIsDown = (code) => t5Input.keyIsDown(code);
    }
    if (!('movedX' in window)) {
        globalScope.movedX = () => t5Input.movedX;
    }
    if (!('movedY' in window)) {
        globalScope.movedY = () => t5Input.movedY;
    }
    if (!('requestPointerLock' in window)) {
        globalScope.requestPointerLock = () => t5Input.requestPointerLock();
    }
    if (!('exitPointerLock' in window)) {
        globalScope.exitPointerLock = () => t5Input.exitPointerLock();
    }
    if (!('cursor' in window)) {
        globalScope.cursor = (type, x, y) => t5Input.cursor(type, x, y);
    }
    if (!('noCursor' in window)) {
        globalScope.noCursor = () => t5Input.noCursor();
    }
    
    $.disableContextMenu = function () {
        if ($.canvas) {
            $.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }
};

// Integrate the input add-on
T5.addOns.input(T5.prototype, T5.prototype, window);