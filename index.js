require('dotenv').config()
var Server = require('ssb-server')
var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')
var caps = require('ssb-caps')
var fs = require('fs')
var path = require('path')

var config = Config('ssc', { caps })
var keyPath = path.join(config.path, 'secret')
config.keys = ssbKeys.loadOrCreateSync(keyPath)

console.log('**config**', config)

function start () {
    Server
        .use(require('ssb-master'))
        .use(require('ssb-gossip'))
        .use(require('ssb-replicate'))
        .use(require('ssb-backlinks'))

    var server = Server(config)

    server.whoami((err, feed) => {
        console.log('who am i', err, feed)
        server.close(() => console.log('server closed'))
    })

    // save an updated list of methods this server has made public
    // in a location that ssb-client will know to check
    var manifest = server.getManifest()
    console.log('**manifest**', manifest)

    // fs.writeFileSync(
    //     path.join(config.path, 'manifest.json'), // ~/.ssb/manifest.json
    //     JSON.stringify(manifest)
    // )

    return server
}


