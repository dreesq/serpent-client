import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

const isWatching = process.argv.includes('-w') || process.argv.includes('--watch');

const config = {
    input: './index.js',
    output: {
        file: './dist/index.js',
        format: 'umd',
        name: 'Serpent'
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            runtimeHelpers: true,
            plugins: [
                '@babel/plugin-transform-runtime'
            ],
            presets: [
                ["@babel/env"],
            ]
        }),
        replace({
            delimiters: ["", ""],
            "_typeof2(Symbol.iterator)": "typeof Symbol.iterator",
            "_typeof2(obj);": "typeof obj;"
        })
    ]
};

if (isWatching) {
    config.plugins.push(serve('dist'), livereload());
}

export default config;