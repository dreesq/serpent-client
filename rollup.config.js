// rollup.config.js
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const isWatching = process.argv.includes('-w') || process.argv.includes('--watch');

const config = {
    input: './index.js',
    output: {
        file: './dist/index.js',
        format: 'umd',
        name: 'Serpent'
    },
    plugins: [
        commonjs(),
        resolve(),
        babel({
            presets: [
                ["@babel/env"]
            ]
        })
    ]
};

if (isWatching) {
    config.plugins.push(serve('dist'), livereload());
}

export default config;