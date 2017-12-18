import { deepAssign, each, getNode, isObject, raf } from 'tealight'
import { appendCssToHead, hasChildElements } from './dom-utils'
import { toCssText } from './transformers'
import * as styles from './styles'

let _uid = 0
let _state = {}

function Poom(target, options = {}) {
	this.root = getNode(target)
	if (!this.root) {
		throw new Error('No target found.')
	}
	if (!hasChildElements(this.root)) {
		throw new Error('Target has no children.')
	}

	this.id = _uid++
	let state = deepAssign(
		{},
		{
			vertical: false,
			horizontal: false,
			ratio: null,
			size: null,
			scrolled: null
		},
		options
	)
	this.setState(state)

	this.scrollable = document.createElement('div')
	state.horizontal
		? this.scrollable.setAttribute('data-poom-scrollable-x', '')
		: this.scrollable.setAttribute('data-poom-scrollable-y', '')

	while (this.root.firstChild) {
		this.scrollable.appendChild(this.root.firstChild)
	}

	this.bar = document.createElement('div')
	this.bar.setAttribute('data-poom-bar', '')

	this.viewable = document.createElement('div')
	this.viewable.setAttribute('data-poom-viewable', '')
	this.viewable.appendChild(this.scrollable)
	this.viewable.appendChild(this.bar)

	this.root.setAttribute('data-poom-root', this.id)
	this.root.appendChild(this.viewable)

	this.handleDown = _handleDown.bind(this)
	this.handleMove = _handleMove.bind(this)
	this.handleUp = _handleUp.bind(this)
	this.update = _update.bind(this)

	window.addEventListener('resize', this.update)
	this.bar.addEventListener('mousedown', this.handleDown)
	this.scrollable.addEventListener('scroll', this.update)

	this.setState({ instance: this })
	this.update()
}

Object.defineProperty(Poom, 'state', { get: () => _state })
Object.defineProperty(Poom, 'setState', {
	get: () => updater => {
		let state
		{
			if (isObject(updater)) state = updater
			if (typeof updater === 'function') state = updater(_state)
		}
		_state = deepAssign({}, _state, state)
		_render()
		return _state
	}
})

Poom.prototype.setState = function(updater) {
	if (isObject(updater)) {
		return Poom.setState({ [this.id]: updater })
	}
	if (typeof updater === 'function') {
		return Poom.setState({ [this.id]: updater(_state) })
	}
}

function _update() {
	raf(() => {
		let clientSize
		let scrollCurrent
		let scrollTotal
		const state = Poom.state[this.id]

		if (state.vertical && !state.horizontal) {
			clientSize = this.scrollable.clientHeight
			scrollCurrent = this.scrollable.scrollTop
			scrollTotal = this.scrollable.scrollHeight
		}

		if (state.horizontal && !state.vertical) {
			clientSize = this.scrollable.clientWidth
			scrollCurrent = this.scrollable.scrollLeft
			scrollTotal = this.scrollable.scrollWidth
		}

		const scrolled = scrollCurrent / scrollTotal * 100
		const ratio = clientSize / scrollTotal
		const size = Math.max(ratio * 100, 10)

		this.setState({ ratio, scrolled, size })
	})
}

function _handleDown(event) {
	const state = Poom.state[this.id]
	if (state.vertical && !state.horizontal) this.setState({ lastPosition: event.clientY })
	if (state.horizontal && !state.vertical) this.setState({ lastPosition: event.clientX })
	document.addEventListener('mousemove', this.handleMove)
	document.addEventListener('mouseup', this.handleUp)
}

function _handleMove(event) {
	const state = Poom.state[this.id]
	raf(() => {
		/**
		 * When the library supports both bars simultaneously,
		 * this bit of code should easily clean up...
		 */
		if (state.vertical && !state.horizontal) {
			const delta = event.clientY - state.lastPosition
			this.setState({ lastPosition: event.clientY })
			this.scrollable.scrollTop += delta / state.ratio
		}

		if (state.horizontal && !state.vertical) {
			const delta = event.clientX - state.lastPosition
			this.setState({ lastPosition: event.clientX })
			this.scrollable.scrollLeft += delta / state.ratio
		}
	})
}

function _handleUp() {
	document.removeEventListener('mousemove', this.handleMove)
	document.removeEventListener('mouseup', this.handleUp)
}

function _render() {
	const uniques = []
	each(Poom.state, (poom, id, state) => {
		const unique = styles.unique(state[id], id)
		uniques.push(unique)
	})
	const cssObject = deepAssign({}, styles.common, ...uniques)
	const css = toCssText(cssObject)
	appendCssToHead(css)
}

export default Poom
