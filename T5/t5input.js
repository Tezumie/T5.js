//************************************************************************//
//*******************************-T5Input-********************************//
//************************************************************************//
T5.addOns.input = ($, p, globalScope) => {
    globalScope = window
    // Define constants
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

    // Initialize properties
    $.keysPressed = new Set();
    $.keyIsPressed = false;
    $.key = '';
    $.keyCode = 0;
    $.mouseButton = '';
    $.mouseIsPressed = false;
    $.movedX = 0;
    $.movedY = 0;
    $.mouseX = 0;
    $.mouseY = 0;
    $.pmouseX = 0;
    $.pmouseY = 0;
    $.winMouseX = 0;
    $.winMouseY = 0;
    $.pwinMouseX = 0;
    $.pwinMouseY = 0;


    // Define methods
    $._onkeydown = function (e) {
        $.keysPressed.add(e.keyCode);
        $.keyIsPressed = true;
        $.key = e.key;
        $.keyCode = e.keyCode;

        // Update global variables
        globalScope.keyIsPressed = $.keyIsPressed;
        globalScope.key = $.key;
        globalScope.keyCode = $.keyCode;

        if (typeof globalScope.keyPressed === 'function') {
            globalScope.keyPressed(e);
        }
    };

    $._onkeyup = function (e) {
        $.keysPressed.delete(e.keyCode);
        $.keyIsPressed = $.keysPressed.size > 0;
        $.key = e.key;
        $.keyCode = e.keyCode;

        // Update global variables
        globalScope.keyIsPressed = $.keyIsPressed;
        globalScope.key = $.key;
        globalScope.keyCode = $.keyCode;

        if (typeof globalScope.keyReleased === 'function') {
            globalScope.keyReleased(e);
        }
    };

    $._keyTyped = function (e) {
        if (typeof globalScope.keyTyped === 'function') {
            globalScope.keyTyped(e);
        }
    };

    $._onmousemove = function (e) {
        $._updateMouse(e);
        if ($.mouseIsPressed) {
            if (typeof globalScope.mouseDragged === 'function') {
                globalScope.mouseDragged(e);
            }
        } else {
            if (typeof globalScope.mouseMoved === 'function') {
                globalScope.mouseMoved(e);
            }
        }
    };

    $._onmousedown = function (e) {
        $._updateMouse(e);
        $.mouseIsPressed = true;
        $.mouseButton = ['left', 'middle', 'right'][e.button];

        // Update global variables
        globalScope.mouseIsPressed = $.mouseIsPressed;
        globalScope.mouseButton = $.mouseButton;

        if (typeof globalScope.mousePressed === 'function') {
            globalScope.mousePressed(e);
        }
    };

    $._onmouseup = function (e) {
        $._updateMouse(e);
        $.mouseIsPressed = false;

        // Update global variables
        globalScope.mouseIsPressed = $.mouseIsPressed;

        if (typeof globalScope.mouseReleased === 'function') {
            globalScope.mouseReleased(e);
        }
    };

    $._onclick = function (e) {
        $._updateMouse(e);
        $.mouseIsPressed = true;

        // Update global variables
        globalScope.mouseIsPressed = $.mouseIsPressed;

        if (typeof globalScope.mouseClicked === 'function') {
            globalScope.mouseClicked(e);
        }

        $.mouseIsPressed = false;
        globalScope.mouseIsPressed = $.mouseIsPressed;
    };

    $._doubleClicked = function (e) {
        if (typeof globalScope.doubleClicked === 'function') {
            globalScope.doubleClicked(e);
        }
    };

    $._mouseWheel = function (e) {
        if (typeof globalScope.mouseWheel === 'function') {
            globalScope.mouseWheel(e);
        }
    };

    $._calculateCanvasMetrics = function () {
        if (!$) { return; }
        const { canvas } = $;
        if (!canvas) { return; }
        const rect = canvas.getBoundingClientRect();
        const aspectRatioCanvas = canvas.width / canvas.height;
        const aspectRatioRect = rect.width / rect.height;

        const isCanvasWider = aspectRatioCanvas > aspectRatioRect;
        const displayedWidth = isCanvasWider ? rect.width : rect.height * aspectRatioCanvas;
        const displayedHeight = isCanvasWider ? rect.width / aspectRatioCanvas : rect.height;

        $.canvasMetrics = {
            offsetX: (rect.width - displayedWidth) / 2,
            offsetY: (rect.height - displayedHeight) / 2,
            scaleX: canvas.width / displayedWidth,
            scaleY: canvas.height / displayedHeight,
            rect,
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    $._updateMouse = function (e) {
        if (e.changedTouches) return;

        const { canvasMetrics } = $;
       // if (!canvasMetrics || window.innerWidth !== canvasMetrics.width || window.innerHeight !== canvasMetrics.height) {
            $._calculateCanvasMetrics();
      //  }
        if (!$.canvasMetrics) { return; }
        const { offsetX, offsetY, scaleX, scaleY, rect } = $.canvasMetrics;
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Update previous mouse positions
        $.pmouseX = $.mouseX;
        $.pmouseY = $.mouseY;
        $.pwinMouseX = $.winMouseX;
        $.pwinMouseY = $.winMouseY;

        // Update current mouse positions
        $.mouseX = $.scaleT5Mouse((e.clientX - rect.left - offsetX + scrollX) * scaleX);
        $.mouseY = $.scaleT5Mouse((e.clientY - rect.top - offsetY + scrollY) * scaleY);
        $.winMouseX = $.scaleT5Mouse(e.clientX + scrollX);
        $.winMouseY = $.scaleT5Mouse(e.clientY + scrollY);

        // Update global variables
        globalScope.mouseX = $.mouseX;
        globalScope.mouseY = $.mouseY;
        globalScope.pmouseX = $.pmouseX;
        globalScope.pmouseY = $.pmouseY;
        globalScope.winMouseX = $.winMouseX;
        globalScope.winMouseY = $.winMouseY;
        globalScope.pwinMouseX = $.pwinMouseX;
        globalScope.pwinMouseY = $.pwinMouseY;
    };

    $.keyIsDown = function (keyCode) {
        return $.keysPressed.has(keyCode);
    };

    $.requestPointerLock = function () {
        if ($.canvas) {
            $.canvas.requestPointerLock();
        }
    };

    $.exitPointerLock = function () {
        document.exitPointerLock();
    };

    $.cursor = function (type = 'default', x = 0, y = 0) {
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
    };

    $.noCursor = function () {
        const canvas = $.canvas;
        canvas.style.cursor = 'none';
    };

    // Disable context menu on the canvas
    $.disableContextMenu = function () {
        if ($.canvas) {
            $.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    };

    $.initEventListeners = function () {
        const canvas = $.canvas;
        if (!canvas) {

            return;
        }

        // Attach mouse event listeners to the canvas
        window.addEventListener('mousemove', (e) => $._onmousemove(e));
        canvas.addEventListener('mousedown', (e) => $._onmousedown(e));
        canvas.addEventListener('mouseup', (e) => $._onmouseup(e));
        canvas.addEventListener('click', (e) => $._onclick(e));
        canvas.addEventListener('dblclick', (e) => $._doubleClicked(e));
        canvas.addEventListener('wheel', (e) => $._mouseWheel(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable context menu

        // Keyboard events are attached to the document
        window.addEventListener('keydown', (e) => $._onkeydown(e));
        window.addEventListener('keyup', (e) => $._onkeyup(e));
        window.addEventListener('keypress', (e) => $._keyTyped(e));

        // Recalculate canvas metrics on window resize
        window.addEventListener('resize', () => {
            $._calculateCanvasMetrics();
        });

        // Initial calculation of canvas metrics
        $._calculateCanvasMetrics();
    }
};

// Integrate the input add-on
T5.addOns.input(T5.prototype, T5.prototype, window);