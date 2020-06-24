module.exports = {

    // rollup
    rollup: {
        input: 'src/index.js',
        output: {
          file: 'build/three-stuff.js',
          format: 'module',
      },
    },

    // copy + trigger file change (for HMR)
    copyDestinations: [

    ],

    // serve web
    port: 8000,
}
