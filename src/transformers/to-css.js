import { isObject } from 'tealight'
import toKebab from './to-kebab'

const toCss = (selector, source) => {
	try {
		document.querySelector(selector)
	} catch (err) {
		throw new Error('Selector is not valid.')
	}

	if (!isObject(source) || !Object.keys(source).length > 0)
		throw new Error('No object properties found.')

	const _selector = selector
		.split(',')
		.map(s => s.trim())
		.join(',\n')

	let output = `${_selector} {`
	output += Object.keys(source)
		.sort()
		.reduce((acc, key) => (acc += `\n\t${toKebab(key)}: ${source[key]};`), '')

	return `${output}\n}`
}

export default toCss
