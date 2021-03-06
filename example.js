var S = require('pull-stream')
var http = require('http')
var WS_PORT = process.env.WS_PORT || 8888
var ws = require('pull-ws/server')
var muxrpc = require('muxrpc')
var { manifest, api } = require('./')
// var manifest = require('./manifest.json')

// in here, we make an http & ws server that makes calls to the ssb feed
// in `createFeed`

var httpServer = http.createServer(function onRequest (req, res) {
    var { pathname } = new URL(req.url)
    console.log('req pathname', pathname)
}).listen(WS_PORT, function (err) {
    if (err) throw err
    console.log('**ws listening on ' + WS_PORT)
})

// httpServer.on('upgrade', function upgrade (req, socket, head) {
//     console.log('**upgrade event**')
// })

// each ws connection is a new user
ws({
    server: httpServer,

    verifyClient: function (info, cb) {
        var { req } = info

        console.log('**headers**', req.headers)
        // console.log('**info**', info)
        console.log('**origin**', info.origin)
        console.log('**secure**', info.secure)

        cb(true)
        // return true
    }

}, function onConnection (wsStream) {
    console.log('got ws connection')

    // need to verify that the connector has the corresponding private key
    // for a given public key

    // arguments are (remote, local)
    var rpcServer = muxrpc(null, manifest)(api)
    var rpcServerStream = rpcServer.createStream(function onEnd (err) {
        if (err) console.log('rpc stream close', err)
    })

    S(wsStream, rpcServerStream, wsStream)
})

