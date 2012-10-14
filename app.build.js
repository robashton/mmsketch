({
  appDir: 'src/frontend',
  baseUrl: './',
  dir: 'site',
  optimize: 'none',
  paths: {
    'eventable': '../../lib/eventable',
    'artpad': '../../lib/artpad',
    'canvas': '../../lib/canvas'
  },
  modules: [
    {
      name: 'app'
    }
  ]
})
