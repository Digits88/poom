const appendCssToHead = (() => {
	const head = document.head || document.getElementsByTagName('head')[0]
	const style = document.createElement('style')
	style.type = 'text/css'

	return css => {
		if (style.styleSheet) {
			style.styleSheet.cssText = css
		} else {
			const cssTextNode = document.createTextNode(css)
			while (style.firstChild) style.firstChild.remove()
			style.appendChild(cssTextNode)
		}
		head.appendChild(style)
	}
})()

export default appendCssToHead
