var config = {
  'dev': {
    fbcallback: 'http://localhost:8080/auth/facebook/callback',
    fbclientid: '317150545045671',
    fbclientsecret: 'b5290692796e002d8a442bf346e810db',
    port: 8080,
    secret: 'i like coffee',
    redisport: null,
    imageDir: '/home/robashton/working/images/'
  },
  'production': {
    fbcallback: 'http://wedrawthings.com/auth/facebook/callback',
    fbclientid: '174303766035042',
    fbclientsecret: 'a6bea18ad44248eb94a348471eccc729',
    port: 8004,
    secret: '23g24ngk2mtg23ntgi23ngk2gn23g22',
    persistence: 'redis',
    redisport: null,
    imageDir: '/root/data/mmsketchimages/'
  }
}
var cfg = config[process.env.NODE_ENV || 'dev']
module.exports = cfg
