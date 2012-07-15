var config = {
  'dev': {
    fbcallback: 'http://localhost:8080/auth/facebook/callback',
    fbclientid: '317150545045671',
    fbclientsecret: 'b5290692796e002d8a442bf346e810db',
    port: 8080,
    secret: 'i like coffee',
    roundTime: 10,
    roundIntervalTime: 10000,
    redisport: null
  },
  'prod': {
    fbcallback: 'http://wedrawthings.com/auth/facebook/callback',
    fbclientid: '174303766035042',
    fbclientsecret: 'a6bea18ad44248eb94a348471eccc729',
    port: 8004,
    secret: '23g24ngk2mtg23ntgi23ngk2gn23g22',
    roundTime: 90,
    roundIntervalTime: 10000,
    persistence: 'redis',
    redisport: null
  }
}
var cfg = config[process.env.node_env || 'dev']
if(process.env.test)
  cfg.roundIntervalTime = 0

module.exports = cfg
