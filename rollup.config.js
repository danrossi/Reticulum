const babel = require('rollup-plugin-babel'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs');
import uglify from 'rollup-plugin-uglify';
export default {
    entry: 'src/Reticulum.js',
    indent: '\t',
    external:['three'], 
    globals: { three: 'THREE' },
    plugins: [
        babel({
            externalHelpers: false,
            exclude: './node_modules/**',
            plugins: ["wildcard"],
            //"presets": [ [ "es2015", { "modules": false } ] ]
            presets: ['es2015-rollup']
        }),
        nodeResolve({
            extensions: ['.js'],
            main: true,
            jsnext: true,
            browser: true,
            preferBuiltins: false
        }),
        commonjs({
            include: './node_modules/**'
        })
        /*uglify({
       output: {
         comments: false
       },
    // Compression specific options
       compress: {
            warnings: true,
            dead_code: true,
            unused: true,
            collapse_vars: true,
            join_vars: true,
            reduce_vars: true,
            passes: 1,
         // Drop console statements
            drop_console: true
       }
     })*/
    ],
    targets: [{
        format  : 'umd',
        name: 'Reticulum',
        //moduleName: '',
        dest: 'build/reticulum.js'
    }]
};