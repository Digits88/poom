/*! @license Poom v0.1.0

Copyright 2017 Fisssion LLC. All rights reserved.

*/
/*! @license Tealight v0.1.2

Copyright 2017 Fisssion LLC.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
var polyfill$1 = (function () {
	var clock = Date.now();

	return function (callback) {
		var currentTime = Date.now();
		if (currentTime - clock > 16) {
			clock = currentTime;
			callback(currentTime);
		} else {
			setTimeout(function () { return polyfill$1(callback); }, 0);
		}
	}
})();

var raf = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	polyfill$1;

function isObject(x) {
	return (
		x !== null &&
		x instanceof Object &&
		(x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]')
	)
}

function each(collection, callback) {
	if (isObject(collection)) {
		var keys = Object.keys(collection);
		return keys.forEach(function (key) { return callback(collection[key], key, collection); })
	}
	if (collection instanceof Array) {
		return collection.forEach(function (item, i) { return callback(item, i, collection); })
	}
	throw new TypeError('Expected either an array or object literal.')
}

function deepAssign(target) {
	var arguments$1 = arguments;

	var sources = [], len = arguments.length - 1;
	while ( len-- > 0 ) { sources[ len ] = arguments$1[ len + 1 ]; }

	if (isObject(target)) {
		each(sources, function (source) {
			each(source, function (data, key) {
				if (isObject(data)) {
					if (!target[key] || !isObject(target[key])) {
						target[key] = {};
					}
					deepAssign(target[key], data);
				} else {
					target[key] = data;
				}
			});
		});
		return target
	} else {
		throw new TypeError('Target must be an object literal.')
	}
}

function isNode(x) {
	return typeof window.Node === 'object'
		? x instanceof window.Node
		: x !== null &&
			typeof x === 'object' &&
			typeof x.nodeType === 'number' &&
			typeof x.nodeName === 'string'
}

function getNode(target, container) {
	if ( container === void 0 ) { container = document; }

	if (typeof target === 'string') {
		try {
			return container.querySelector(target)
		} catch (e) {
			return null
		}
	}
	return isNode(target) ? target : null
}

var appendCssToHead = (function () {
	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.type = 'text/css';

	return function (css) {
		if (style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			var cssTextNode = document.createTextNode(css);
			while (style.firstChild) { style.firstChild.remove(); }
			style.appendChild(cssTextNode);
		}
		head.appendChild(style);
	}
})();

function hasChildElements(element) {
	var bool = false;
	if (element.children) {
		bool = element.children.length !== 0;
	} else {
		for (var child = element.firstChild; !bool && child; child = child.nextSibling) {
			if (child.nodeType == 1) { bool = true; }
		}
	}
	return bool
}

var toKebab = function (source) { return source
		.replace(/_/g, '')
		.replace(/([A-Z])/g, '-$1')
		.replace(/^-/, '')
		.toLowerCase(); };

var toCss = function (selector, source) {
	try {
		document.querySelector(selector);
	} catch (err) {
		throw new Error('Selector is not valid.')
	}

	if (!isObject(source) || !Object.keys(source).length > 0)
		{ throw new Error('No object properties found.') }

	var _selector = selector
		.split(',')
		.map(function (s) { return s.trim(); })
		.join(',\n');

	var output = _selector + " {";
	output += Object.keys(source)
		.sort()
		.reduce(function (acc, key) { return (acc += "\n\t" + (toKebab(key)) + ": " + (source[key]) + ";"); }, '');

	return (output + "\n}")
};

var toCssText = function (cssObject) {
	var css = [];
	each(cssObject, function (rules, selector) { return css.push(toCss(selector, rules)); });
	return css.join('\n')
};

var obj;
var obj$1;
var common = {
	'[data-poom-scrollable-x]': {
		overflowX: 'auto',
		overflowY: 'hidden'
	},
	'[data-poom-scrollable-y]': {
		overflowY: 'auto',
		overflowX: 'hidden'
	},
	'[data-poom-scrollable-x], [data-poom-scrollable-y]': {
		position: 'absolute',
		top: '-20px',
		right: '-20px',
		bottom: '-20px',
		left: '-20px',
		padding: '20px'
	},
	'[data-poom-viewable]': {
		position: 'absolute',
		overflow: 'hidden',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	},
	'[data-poom-bar]': {
		position: 'absolute'
	}
};

var unique = function (state, id) {
	var selector = "[data-poom-root=\"" + id + "\"] [data-poom-bar]";
	return ( obj$1 = {}, obj$1[selector] = ( obj = {}, obj[state.horizontal ? 'width' : 'height'] = ((state.size || 10) + "%"), obj[state.horizontal ? 'left' : 'top'] = ((state.scrolled || 0) + "%"), obj[state.horizontal ? 'bottom' : 'right'] = 0, obj[state.horizontal ? 'height' : 'width'] = '10px', obj), obj$1)
};

var _uid = 0;
var _state = {};

function Poom(target, options) {
	var this$1 = this;
	if ( options === void 0 ) options = {};

	this.root = getNode(target);
	if (!this.root) {
		throw new Error('No target found.')
	}
	if (!hasChildElements(this.root)) {
		throw new Error('Target has no children.')
	}

	this.id = _uid++;
	var state = deepAssign(
		{},
		{
			vertical: false,
			horizontal: false,
			ratio: null,
			size: null,
			scrolled: null
		},
		options
	);
	this.setState(state);

	this.scrollable = document.createElement('div');
	state.horizontal
		? this.scrollable.setAttribute('data-poom-scrollable-x', '')
		: this.scrollable.setAttribute('data-poom-scrollable-y', '');

	while (this.root.firstChild) {
		this$1.scrollable.appendChild(this$1.root.firstChild);
	}

	this.bar = document.createElement('div');
	this.bar.setAttribute('data-poom-bar', '');

	this.viewable = document.createElement('div');
	this.viewable.setAttribute('data-poom-viewable', '');
	this.viewable.appendChild(this.scrollable);
	this.viewable.appendChild(this.bar);

	this.root.setAttribute('data-poom-root', this.id);
	this.root.appendChild(this.viewable);

	this.handleDown = _handleDown.bind(this);
	this.handleMove = _handleMove.bind(this);
	this.handleUp = _handleUp.bind(this);
	this.update = _update.bind(this);

	window.addEventListener('resize', this.update);
	this.bar.addEventListener('mousedown', this.handleDown);
	this.scrollable.addEventListener('scroll', this.update);

	this.setState({ instance: this });
	this.update();
}

Object.defineProperty(Poom, 'state', { get: function () { return _state; } });
Object.defineProperty(Poom, 'setState', {
	get: function () { return function (updater) {
		var state;
		{
			if (isObject(updater)) { state = updater; }
			if (typeof updater === 'function') { state = updater(_state); }
		}
		_state = deepAssign({}, _state, state);
		_render();
		return _state
	}; }
});

Poom.prototype.setState = function(updater) {
	var obj, obj$1;

	if (isObject(updater)) {
		return Poom.setState(( obj = {}, obj[this.id] = updater, obj))
	}
	if (typeof updater === 'function') {
		return Poom.setState(( obj$1 = {}, obj$1[this.id] = updater(_state), obj$1))
	}
};

function _update() {
	var this$1 = this;

	raf(function () {
		var clientSize;
		var scrollCurrent;
		var scrollTotal;
		var state = Poom.state[this$1.id];

		if (state.vertical && !state.horizontal) {
			clientSize = this$1.scrollable.clientHeight;
			scrollCurrent = this$1.scrollable.scrollTop;
			scrollTotal = this$1.scrollable.scrollHeight;
		}

		if (state.horizontal && !state.vertical) {
			clientSize = this$1.scrollable.clientWidth;
			scrollCurrent = this$1.scrollable.scrollLeft;
			scrollTotal = this$1.scrollable.scrollWidth;
		}

		var scrolled = scrollCurrent / scrollTotal * 100;
		var ratio = clientSize / scrollTotal;
		var size = Math.max(ratio * 100, 10);

		this$1.setState({ ratio: ratio, scrolled: scrolled, size: size });
	});
}

function _handleDown(event) {
	var state = Poom.state[this.id];
	if (state.vertical && !state.horizontal) { this.setState({ lastPosition: event.clientY }); }
	if (state.horizontal && !state.vertical) { this.setState({ lastPosition: event.clientX }); }
	document.addEventListener('mousemove', this.handleMove);
	document.addEventListener('mouseup', this.handleUp);
}

function _handleMove(event) {
	var this$1 = this;

	var state = Poom.state[this.id];
	raf(function () {
		/**
		 * When the library supports both bars simultaneously,
		 * this bit of code should easily clean up...
		 */
		if (state.vertical && !state.horizontal) {
			var delta = event.clientY - state.lastPosition;
			this$1.setState({ lastPosition: event.clientY });
			this$1.scrollable.scrollTop += delta / state.ratio;
		}

		if (state.horizontal && !state.vertical) {
			var delta$1 = event.clientX - state.lastPosition;
			this$1.setState({ lastPosition: event.clientX });
			this$1.scrollable.scrollLeft += delta$1 / state.ratio;
		}
	});
}

function _handleUp() {
	document.removeEventListener('mousemove', this.handleMove);
	document.removeEventListener('mouseup', this.handleUp);
}

function _render() {
	var uniques = [];
	each(Poom.state, function (poom, id, state) {
		var unique$$1 = unique(state[id], id);
		uniques.push(unique$$1);
	});
	var cssObject = deepAssign.apply(void 0, [ {}, common ].concat( uniques ));
	var css = toCssText(cssObject);
	appendCssToHead(css);
}

export default Poom;
