export default function hasChildElements(element) {
	let bool = false
	if (element.children) {
		bool = element.children.length !== 0
	} else {
		for (let child = element.firstChild; !bool && child; child = child.nextSibling) {
			if (child.nodeType == 1) bool = true
		}
	}
	return bool
}
