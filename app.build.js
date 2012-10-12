({
  appDir: 'src/frontend',
  baseUrl: './',
  dir: 'site',
  optimize: 'none',
  paths: {
    'jquery': ':empty',
    'underscore': ':empty',
  },
  shim: {
    'jquery': { exports: '$'},
    'underscore': { exports: '_' },
  },
  modules: [
    {
      name: 'app'
    }
  ]
})
