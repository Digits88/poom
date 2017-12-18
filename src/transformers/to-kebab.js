const toKebab = source =>
	source
		.replace(/_/g, '')
		.replace(/([A-Z])/g, '-$1')
		.replace(/^-/, '')
		.toLowerCase()

export default toKebab
