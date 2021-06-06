var http = require('http')
var WS_PORT = process.env.WS_PORT || 8000
var ws = require('pull-ws/server')
var muxrpc = require('muxrpc')
const url = require('url')
var Server = require('./')

var sbot = Server()

var httpServer = http.createServer(function onRequest (req, res) {
    var { pathname } = url.parse(req.url)
    console.log('req pathname', pathname)
}).listen(WS_PORT, function (err) {
    if (err) throw err
    console.log('**listening on ' + WS_PORT)
})

ws({ server: httpServer }, function onConnection (wsStream) {
    console.log('got ws connection')

    var manifest = sbot.getManifest()

    // arguments are (remote, local)
    var rpcServer = muxrpc(null, manifest)(sbot)
    var rpcServerStream = rpcServer.createStream(function onEnd (err) {
        if (err) console.log('rpc stream close', err)
    })

    S(wsStream, rpcServerStream, wsStream)
})

