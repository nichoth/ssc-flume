var S = require('pull-stream')
var http = require('http')
var WS_PORT = process.env.WS_PORT || 8888
var ws = require('pull-ws/server')
var muxrpc = require('muxrpc')
var server = require('./')
var { manifest, api } = server
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

    // doesn't work
    // The return value (Boolean) of the function determines whether or not
    // to accept the handshake.
    // verifyClient: function (info, cb) {
    //     // console.log('***verify client***', info)
    //     var { req } = info


    //     // req.headers
    //     // { upgrade: 'websocket' }


    //     // console.log('***origin***', info.origin)
    //     // console.log('***req***', info.req)
    //     // console.log('***secure***', info.secure)
    //     console.log('**headers**', req.headers)
    //     // console.log('verify client cb', cb)

    //     // just accept any connections for now
    //     // but would want to verify the `write` requests
    //     return true
    // }

}, function onConnection (wsStream) {
    console.log('got ws connection')

    // on connection, how do we get the keys?

    // need to verify that the connector has the corresponding private key
    // for a given public key

    // var keys = { public: 'a', private: 'b' }
    // var feed = createFeed(keys)

    // var api = server.api

    // arguments are (remote, local)
    var rpcServer = muxrpc(null, manifest)(api)
    var rpcServerStream = rpcServer.createStream(function onEnd (err) {
        if (err) console.log('rpc stream close', err)
    })

    S(wsStream, rpcServerStream, wsStream)
})

