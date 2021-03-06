import buble from 'rollup-plugin-buble'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import banner from './rollup.conf.banner'

export default {
	banner,
	input: './src/index.js',
	plugins: [json(), nodeResolve({ jsnext: true, main: true }), buble()],
	output: [
		{ format: 'umd', file: 'dist/poom.js', name: 'Poom' },
		{ format: 'es', file: 'dist/poom.es.js' }
	]
}
