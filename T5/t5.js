/*!
 * © 2024 Tezumie-aijs.io
 * Licensed under CC BY-NC 4.0
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

window.t5PreloadCount = 0;
window.t5PreloadDone = 0;
window.windowWidth = window.innerWidth;
window.windowHeight = window.innerHeight;
p5 = T5;
T5.methods = {
    init: [],
    pre: [],
    post: [],
    remove: []
};
T5.prototype.registerPreloadMethod = (methodName, functionObject) => {
    T5.prototype[methodName] = functionObject[methodName];
};

T5.prototype.registerMethod = function (methodName, functionObject) {
    if (!T5.methods[methodName]) {
        T5.methods[methodName] = [];
    }
    T5.methods[methodName].push(functionObject);
};

function T5(scope = 'global', parent) {
    let $ = this;

    function setScope(scope) {
        if (scope === 'auto') {
            scope = (window.setup || window.draw) ? 'global' : 'local';
        }
        $._globalSketch = (scope === 'global');
        return $._globalSketch ? window : undefined;
    }

    const globalScope = setScope(scope);

    const proxy = new Proxy($, {
        set: (target, property, value) => {
            target[property] = value;
            if ($._globalSketch) globalScope[property] = value;
            return true;
        }
    });
    $._incrementPreload = function () {
        window.t5PreloadCount++;
    };
    $._decrementPreload = function () {
        window.t5PreloadCount--;
    };
    $.frameCount = 0;
    $.deltaTime = 16;
    $._setFrameRate = 60;
    $._frameLength = 1000 / $._setFrameRate;
    $._previousFrame = 0;
    $._isLooping = true;
    $._shouldDrawOnce = false;
    $._millisBegin = performance.now();
    $._FRAME_RATE_ALPHA = 0.25;
    $._FRAME_RATE_SAMPLES = 10;
    $._frameRate = $._setFrameRate;
    $._frameRateSamples = [];

    $.millis = () => performance.now() - $._millisBegin;

    $.frameRate = (rate) => {
        if (rate !== undefined) {
            $._setFrameRate = rate;
            $._frameLength = 1000 / $._setFrameRate;
            $._frameRate = rate;
            $._frameRateSamples = [];
        } else {
            return $._frameRate;
        }
    };

    function _draw() {
        for (let preMethod of T5.methods.pre) {
            preMethod.call($);
        }

        $.resetMatrix();
        let now = performance.now();
        $._previousFrame ??= now - $._frameLength;
        if ($._isLooping || $._shouldDrawOnce) {
            requestAnimationFrame(_draw);
        } else if ($.frameCount && !$._redraw) {
            return;
        }
        let timeSinceLast = now - $._previousFrame;
        if (timeSinceLast < $._frameLength - 1.25) return;

        $.deltaTime = now - $._previousFrame;
        const instantaneousFrameRate = 1000 / $.deltaTime;
        $._frameRate = ($._FRAME_RATE_ALPHA * instantaneousFrameRate) + ((1 - $._FRAME_RATE_ALPHA) * $._frameRate);
        $._frameRateSamples.push($._frameRate);
        if ($._frameRateSamples.length > $._FRAME_RATE_SAMPLES) {
            $._frameRateSamples.shift();
        }

        const rollingAverageFrameRate = $._frameRateSamples.reduce((a, b) => a + b, 0) / $._frameRateSamples.length;

        $.frameCount++;
        window.frameCount = $.frameCount;
        window.deltaTime = $.deltaTime;
        $.smoothedFrameRate = rollingAverageFrameRate;

        if ($.context) $.context.save();
        if (typeof $.draw === 'function') $.draw();
        if ($.context) {
            let prevProps = {
                fillStyle: $.context.fillStyle,
                strokeStyle: $.context.strokeStyle,
                lineWidth: $.context.lineWidth,
                lineCap: $.context.lineCap,
                lineJoin: $.context.lineJoin,
                textAlign: $.context.textAlign,
                font: $.context.font,
                globalAlpha: $.context.globalAlpha,
                globalCompositeOperation: $.context.globalCompositeOperation,
                filter: $.context.filter,
                imageSmoothingEnabled: $.context.imageSmoothingEnabled
            };

            $.context.restore();

            $.context.fillStyle = prevProps.fillStyle;
            $.context.strokeStyle = prevProps.strokeStyle;
            $.context.lineWidth = prevProps.lineWidth;
            $.context.lineCap = prevProps.lineCap;
            $.context.lineJoin = prevProps.lineJoin;
            $.context.textAlign = prevProps.textAlign;
            $.context.font = prevProps.font;
            $.context.globalAlpha = prevProps.globalAlpha;
            $.context.globalCompositeOperation = prevProps.globalCompositeOperation;
            $.context.filter = prevProps.filter;
            $.context.imageSmoothingEnabled = prevProps.imageSmoothingEnabled;
        }

        $._previousFrame = now;
        $._shouldDrawOnce = false;
        for (let postMethod of T5.methods.post) {
            postMethod.call($);
        }
    }

    $.noLoop = () => { $._isLooping = false; };
    $.loop = () => { $._isLooping = true; };
    $.isLooping = () => $._isLooping;
    $.redraw = (n = 1) => {
        $._redraw = true;
        for (let i = 0; i < n; i++) {
            _draw();
        }
        $._redraw = false;
    };
    $._setupDone = false

    $._start = () => {
        $._setupDone = true

        if (typeof $.preload === 'function') {
            $.preload();
        }
        if (typeof $.preload !== 'function' || window.t5PreloadCount === window.t5PreloadDone) {

            if (typeof $.setup === 'function') $.setup();

            if ($.frameCount === 0 && $.context === null) $.createCanvas(100, 100);
            $.resetMatrix();
            $._shouldDrawOnce = true;
            requestAnimationFrame(() => {
                _draw();
                if ($._isLooping) requestAnimationFrame(_draw);
            });
        } else {
            const checkPreloadDone = setInterval(() => {
                if (window.t5PreloadCount === window.t5PreloadDone) {
                    clearInterval(checkPreloadDone);
                    $._millisBegin = performance.now();
                    if (typeof $.setup === 'function') $.setup();

                    if ($.frameCount === 0 && $.context === null) $.createCanvas(100, 100);
                    $.resetMatrix();
                    $._shouldDrawOnce = true;
                    requestAnimationFrame(() => {
                        _draw();
                        if ($._isLooping) requestAnimationFrame(_draw);
                    });
                }
            }, 10);
        }
    };

    document.addEventListener('DOMContentLoaded', $._start);

    if ($._globalSketch) {
        for (let method of ['setup', 'draw', 'preload', 'windowResized']) {
            if (window[method]) $[method] = window[method];
        }
        for (let key in $) {
            if (key[0] != '_' && typeof $[key] == 'function') {
                window[key] = $[key].bind($);
            } else if (key[0] != '_') {
                window[key] = $[key];
            }
        }
    }

    for (let m in T5.addOns) {
        T5.addOns[m]($, proxy, globalScope);
    }

    if (T5.methods.init) {
        for (let initMethod of T5.methods.init) {
            if (typeof initMethod === 'function') {
                initMethod.call($);
            }
        }
    }

    if ($._globalSketch) {
        for (let key in $) {
            if (key[0] != '_' && typeof $[key] == 'function') {//&& key != 'createCanvas'
                window[key] = $[key].bind($);
            } else if (key[0] != '_' && typeof $[key] != 'function' && !window[key]) {
                window[key] = $[key];
            }
        }
    }

    if ($._globalSketch) {
        globalScope.T5 = T5;
        window.addEventListener('resize', () => {
            window.windowWidth = window.innerWidth;
            window.windowHeight = window.innerHeight;
            if (typeof $.windowResized === 'function') $.windowResized();
        });

    }
}

T5.addOns = {};

if (typeof window === 'object') {
    window.T5 = T5;
    document.addEventListener('DOMContentLoaded', () => {
        if (!T5._hasGlobal) {
            const instance = new T5('global');
            p5 = T5

            instance.setup = window.setup;
            instance.draw = window.draw;
            instance.windowResized = window.windowResized;
            if (window.setup || window.draw) {
                instance._start();
            }
        }
    });
}