var Server = require('ssb-server')
// var ssbFeed = require('ssb-feed')
var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')
var caps = require('ssb-caps')
// var fs = require('fs')
var path = require('path')
var ssc = require('@nichoth/ssc')
var timestamp = require('monotonic-timestamp')

var config = Config('ssc', { caps })
var keyPath = path.join(config.path, 'secret')
config.keys = ssbKeys.loadOrCreateSync(keyPath)

// console.log('**config**', config)

Server
    .use(require('ssb-master'))
    .use(require('ssb-gossip'))
    .use(require('ssb-friends'))
    // .use(require('ssb-replicate'))
    .use(require('ssb-backlinks'))

// this way you re-use the same sbot over many connections
var sbot = Server(config)

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

            sbot.add({
                key: ssc.getId(msg),
                value: msg,
                timestamp: timestamp()
            }, cb)
        })

        // also: are you following this id?
    }
}

module.exports = { api, /*createFeed,*/ manifest }

