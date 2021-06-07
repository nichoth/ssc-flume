var Server = require('ssb-server')
var ssbFeed = require('ssb-feed')
var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')
var caps = require('ssb-caps')
var fs = require('fs')
var path = require('path')

var config = Config('ssc', { caps })
var keyPath = path.join(config.path, 'secret')
config.keys = ssbKeys.loadOrCreateSync(keyPath)

// console.log('**config**', config)

Server
    .use(require('ssb-master'))
    .use(require('ssb-gossip'))
    .use(require('ssb-replicate'))
    .use(require('ssb-backlinks'))

// this way you re-use the same sbot over many connections
var sbot = Server(config)

function createFeed (keys) {
    var feed = ssbFeed(sbot, keys)
}

module.exports = { createFeed }

// save an updated list of methods this server has made public
// in a location that ssb-client will know to check
var manifest = sbot.getManifest()
// console.log('**manifest**', manifest)

fs.writeFileSync(
    path.join(__dirname, 'manifest.json'), // ~/.ssc/manifest.json
    JSON.stringify(manifest)
)

// return server

