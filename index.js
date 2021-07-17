var Server = require('ssb-server')
var ssbFeed = require('ssb-feed')
var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')
var caps = require('ssb-caps')
// var fs = require('fs')
var path = require('path')
var ssc = require('@nichoth/ssc')

var config = Config('ssc', { caps })
var keyPath = path.join(config.path, 'secret')
config.keys = ssbKeys.loadOrCreateSync(keyPath)

// console.log('**config**', config)

Server
    .use(require('ssb-master'))
    .use(require('ssb-gossip'))
    // .use(require('ssb-replicate'))
    .use(require('ssb-backlinks'))

// this way you re-use the same sbot over many connections
var sbot = Server(config)

function createFeed (keys) {
    // need to re-do this part,
    // so that the `publish` function takes a msg and public key
    var feed = ssbFeed(sbot, keys)
    return feed
}

var manifest = {
    foo: 'async',
    publish: 'async'
}

var api = {
    foo: function (arg, cb) {
        console.log('foo', arg)
        process.nextTick(() => cb(null, arg))
    },

    publish: function ({ msg, keys }, cb) {
        // you can verify the msg just with the msg itself
        // public key is the auther ID
        // use the public key to check the authenticity

        sbot.getLatest(keys.id, function (err, prev) {
            if (err) return cb(err)
            if ( !ssc.isValidMsg(msg, prev, { public: keys.public }) ) {
                return cb(new Error('not valid'))
            }

            sbot.add(msg, cb)
        })

        // the bad part is that it needs private keys
        // var feed = ssbFeed(sbot, alice)
        // feed.publish({
        //     type: 'post',
        //     text: 'hello world, I am alice.'
        // }, function (err) { ... })


        // also: are you following this id?

        // the msg should be fully formed, signed with the priv key

        // process.nextTick(() => cb(null, msg))
    }
}


module.exports = { api, createFeed, manifest }

// save an updated list of methods this server has made public
// in a location that ssb-client will know to check
// var manifest = sbot.getManifest()
// var manifest = {
//     foo: 'async'
// }
// console.log('**manifest**', manifest)

// fs.writeFileSync(
//     path.join(__dirname, 'manifest.json'), // ~/.ssc/manifest.json
//     JSON.stringify(manifest)
// )

// return server

