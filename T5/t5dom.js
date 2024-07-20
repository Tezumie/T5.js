//************************************************************************//
//********************************-T5Dom-*********************************//
//************************************************************************//
class T5Element {
    constructor(element) {
        this.element = element;
        this._eventHandlers = {};
    }

    parent(parent) {
        if (parent === undefined) {
            return this.element.parentElement;
        } else {
            if (typeof parent === 'string') {
                document.getElementById(parent).appendChild(this.element);
            } else if (parent instanceof T5Element) {
                parent.element.appendChild(this.element);
            } else if (parent instanceof HTMLElement) {
                parent.appendChild(this.element);
            }
            return this;
        }
    }

    child(child) {
        if (child === undefined) {
            return Array.from(this.element.children).map(el => new T5Element(el));
        } else {
            if (typeof child === 'string') {
                this.element.appendChild(document.getElementById(child));
            } else if (child instanceof T5Element) {
                this.element.appendChild(child.element);
            } else if (child instanceof HTMLElement) {
                this.element.appendChild(child);
            }
            return this;
        }
    }

    id(id) {
        if (id === undefined) {
            return this.element.id;
        } else {
            this.element.id = id;
            return this;
        }
    }

    class(className) {
        if (className === undefined) {
            return this.element.className;
        } else {
            this.element.className = className;
            return this;
        }
    }

    addClass(className) {
        this.element.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }

    hasClass(className) {
        return this.element.classList.contains(className);
    }

    toggleClass(className) {
        this.element.classList.toggle(className);
        return this;
    }

    position(x, y, positionType = 'absolute') {
        if (x === undefined && y === undefined) {
            return { x: this.element.offsetLeft, y: this.element.offsetTop };
        } else {
            this.element.style.position = positionType;
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            return this;
        }
    }

    size(width, height) {
        if (width === undefined && height === undefined) {
            return { width: this.element.offsetWidth, height: this.element.offsetHeight };
        } else {
            if (width !== undefined) {
                this.element.style.width = `${width}px`;
            }
            if (height !== undefined) {
                this.element.style.height = `${height}px`;
            }
            return this;
        }
    }

    center(align = 'both') {
        this.element.style.position = 'absolute';
        if (align === 'both' || align === 'horizontal') {
            this.element.style.left = '50%';
            this.element.style.transform = 'translateX(-50%)';
        }
        if (align === 'both' || align === 'vertical') {
            this.element.style.top = '50%';
            this.element.style.transform += ' translateY(-50%)';
        }
        return this;
    }

    html(content, append = false) {
        if (content === undefined) {
            return this.element.innerHTML;
        } else {
            if (append) {
                this.element.innerHTML += content;
            } else {
                this.element.innerHTML = content;
            }
            return this;
        }
    }

    style(property, value) {
        if (value === undefined) {
            return this.element.style[property];
        } else {
            this.element.style[property] = value;
            return this;
        }
    }

    attribute(attr, value) {
        if (value === undefined) {
            return this.element.getAttribute(attr);
        } else {
            this.element.setAttribute(attr, value);
            return this;
        }
    }

    removeAttribute(attr) {
        this.element.removeAttribute(attr);
        return this;
    }

    value(value) {
        if (value === undefined) {
            return this.element.value;
        } else {
            this.element.value = value;
            return this;
        }
    }

    checked(checked) {
        if (checked === undefined) {
            return this.element.checked;
        } else {
            this.element.checked = checked;
            return this;
        }
    }

    show() {
        this.element.style.display = '';
        return this;
    }

    hide() {
        this.element.style.display = 'none';
        return this;
    }

    _addEventListener(event, callback) {
        if (callback === false) {
            this.element.removeEventListener(event, this._eventHandlers[event]);
            delete this._eventHandlers[event];
        } else {
            this._eventHandlers[event] = callback;
            this.element.addEventListener(event, callback);
        }
    }

    mousePressed(callback) { return this._addEventListener('mousedown', callback), this; }
    doubleClicked(callback) { return this._addEventListener('dblclick', callback), this; }
    mouseWheel(callback) { return this._addEventListener('wheel', callback), this; }
    mouseReleased(callback) { return this._addEventListener('mouseup', callback), this; }
    mouseClicked(callback) { return this._addEventListener('click', callback), this; }
    mouseMoved(callback) { return this._addEventListener('mousemove', callback), this; }
    mouseOver(callback) { return this._addEventListener('mouseover', callback), this; }
    mouseOut(callback) { return this._addEventListener('mouseout', callback), this; }
    touchStarted(callback) { return this._addEventListener('touchstart', callback), this; }
    touchMoved(callback) { return this._addEventListener('touchmove', callback), this; }
    touchEnded(callback) { return this._addEventListener('touchend', callback), this; }
    dragOver(callback) { return this._addEventListener('dragover', callback), this; }
    dragLeave(callback) { return this._addEventListener('dragleave', callback), this; }
    drop(callback) { return this._addEventListener('drop', callback), this; }
    draggable() {
        this.element.draggable = true;
        return this;
    }

    on(event, callback) {
        this.element.addEventListener(event, callback);
        return this;
    }

    remove() {
        this.element.remove();
    }

    input(callback) {
        return this._addEventListener('input', callback), this;
    }

    // New properties for .x, .y, .width, and .height
    get x() {
        return parseFloat(this.element.style.left || this.element.offsetLeft);
    }

    set x(value) {
        this.element.style.position = 'absolute';
        this.element.style.left = `${value}px`;
    }

    get y() {
        return parseFloat(this.element.style.top || this.element.offsetTop);
    }

    set y(value) {
        this.element.style.position = 'absolute';
        this.element.style.top = `${value}px`;
    }

    get width() {
        return parseFloat(this.element.style.width || this.element.offsetWidth);
    }

    set width(value) {
        this.element.style.width = `${value}px`;
    }

    get height() {
        return parseFloat(this.element.style.height || this.element.offsetHeight);
    }

    set height(value) {
        this.element.style.height = `${value}px`;
    }
}

T5.addOns.dom = ($, p, globalScope) => {
    if (!$.createElement) {
        $.createElement = (tag, html = '') => {
            const el = document.createElement(tag);
            el.innerHTML = html;
            document.body.appendChild(el);
            return new T5Element(el);
        };
    }

  

    class T5Dom {
        constructor() {
            this.elements = [];
        }

        select(selector) {
            const el = document.querySelector(selector);
            return el ? new T5Element(el) : null;
        }

        selectAll(selector) {
            const nodeList = document.querySelectorAll(selector);
            return Array.from(nodeList).map(el => new T5Element(el));
        }

        removeElements() {
            this.elements.forEach(el => el.remove());
            this.elements = [];
        }

        createElement(tag, html = '') {
            const el = document.createElement(tag);
            el.innerHTML = html;
            document.body.appendChild(el);
            const t5Element = new T5Element(el);
            this.elements.push(t5Element);
            return t5Element;
        }

        createDiv(html = '') { return this.createElement('div', html); }
        createP(html = '') { return this.createElement('p', html); }
        createSpan(html = '') { return this.createElement('span', html); }
        createImg(src, alt = '') {
            const img = this.createElement('img');
            img.attribute('src', src).attribute('alt', alt);
            return img;
        }
        createA(href, html = '') {
            const a = this.createElement('a', html);
            a.attribute('href', href);
            return a;
        }
        createSlider(min, max, value, step) {
            const slider = this.createElement('input');
            slider.attribute('type', 'range')
                .attribute('min', min)
                .attribute('max', max)
                .attribute('value', value)
                .attribute('step', step);
            return slider;
        }
        createButton(label, callback) {
            const button = this.createElement('button', label);
            button.on('click', callback);
            return button;
        }
        createCheckbox(label, checked) {
            const checkbox = this.createElement('input');
            checkbox.attribute('type', 'checkbox').checked(checked);
            const labelEl = this.createElement('label', label);
            labelEl.element.appendChild(checkbox.element);
            return checkbox;
        }
        createSelect(options) {
            const select = this.createElement('select');
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.innerHTML = option;
                select.element.appendChild(opt);
            });
            return select;
        }
        createRadio(name, options) {
            const radioGroup = this.createElement('div');
            options.forEach(option => {
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = name;
                radio.value = option;
                const label = document.createElement('label');
                label.innerHTML = option;
                label.appendChild(radio);
                radioGroup.element.appendChild(label);
            });
            return radioGroup;
        }
        createColorPicker(value = '#000000') {
            const colorPicker = this.createElement('input');
            colorPicker.attribute('type', 'color').attribute('value', value);
            return colorPicker;
        }
        createInput(value = '', type = 'text') {
            const input = this.createElement('input');
            input.attribute('type', type).attribute('value', value);
            return input;
        }
        createFileInput(callback) {
            const fileInput = this.createElement('input');
            fileInput.attribute('type', 'file').on('change', callback);
            return fileInput;
        }
        createVideo(src) {
            const video = this.createElement('video');
            video.attribute('src', src).attribute('controls', true);
            return video;
        }
        createAudio(src) {
            const audio = this.createElement('audio');
            audio.attribute('src', src).attribute('controls', true);
            return audio;
        }
        createCapture() {
            const capture = this.createElement('video');
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                capture.element.srcObject = stream;
                capture.element.play();
            });
            return capture;
        }
    }

    const dom = new T5Dom();

    $.select = (selector) => dom.select(selector);
    $.selectAll = (selector) => dom.selectAll(selector);
    $.removeElements = () => dom.removeElements();
    $.createDiv = (html) => dom.createDiv(html);
    $.createP = (html) => dom.createP(html);
    $.createSpan = (html) => dom.createSpan(html);
    $.createImg = (src, alt) => dom.createImg(src, alt);
    $.createA = (href, html) => dom.createA(href, html);
    $.createSlider = (min, max, value, step) => dom.createSlider(min, max, value, step);
    $.createButton = (label, callback) => dom.createButton(label, callback);
    $.createCheckbox = (label, checked) => dom.createCheckbox(label, checked);
    $.createSelect = (options) => dom.createSelect(options);
    $.createRadio = (name, options) => dom.createRadio(name, options);
    $.createColorPicker = (value) => dom.createColorPicker(value);
    $.createInput = (value, type) => dom.createInput(value, type);
    $.createFileInput = (callback) => dom.createFileInput(callback);
    $.createVideo = (src) => dom.createVideo(src);
    $.createAudio = (src) => dom.createAudio(src);
    $.createCapture = () => dom.createCapture();

    if ($._isGlobal) {
        globalScope.select = $.select;
        globalScope.selectAll = $.selectAll;
        globalScope.removeElements = $.removeElements;
        globalScope.createDiv = $.createDiv;
        globalScope.createP = $.createP;
        globalScope.createSpan = $.createSpan;
        globalScope.createImg = $.createImg;
        globalScope.createA = $.createA;
        globalScope.createSlider = $.createSlider;
        globalScope.createButton = $.createButton;
        globalScope.createCheckbox = $.createCheckbox;
        globalScope.createSelect = $.createSelect;
        globalScope.createRadio = $.createRadio;
        globalScope.createColorPicker = $.createColorPicker;
        globalScope.createInput = $.createInput;
        globalScope.createFileInput = $.createFileInput;
        globalScope.createVideo = $.createVideo;
        globalScope.createAudio = $.createAudio;
        globalScope.createCapture = $.createCapture;
    }
};

// Integrate the dom add-on
T5.addOns.dom(T5.prototype, T5.prototype, window);