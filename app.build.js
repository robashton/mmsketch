({
  appDir: 'src/frontend',
  baseUrl: './',
  dir: 'site',
  optimize: 'none',
  paths: {
    'jquery': 'external/jquery-1.7.2.min',
    'underscore': '../../node_modules/underscore/underscore-min',
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
