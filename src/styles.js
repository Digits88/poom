const common = {
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
}

const unique = (state, id) => {
	const selector = `[data-poom-root="${id}"] [data-poom-bar]`
	return {
		[selector]: {
			[state.horizontal ? 'width' : 'height']: `${state.size || 10}%`,
			[state.horizontal ? 'left' : 'top']: `${state.scrolled || 0}%`,
			[state.horizontal ? 'bottom' : 'right']: 0,
			[state.horizontal ? 'height' : 'width']: '10px'
		}
	}
}

export { common, unique }
