import { each } from 'tealight'
import { toCss } from '../transformers'

const toCssText = cssObject => {
	let css = []
	each(cssObject, (rules, selector) => css.push(toCss(selector, rules)))
	return css.join('\n')
}

export default toCssText
