var muxrpc = require('muxrpc')
var wsClient = require('pull-ws/client')
var S = require('pull-stream')
var WS_PORT = '8888'
// replace this with the real URL
var WS_URL = 'ws://localhost:' + WS_PORT
// var manifest = require('./manifest.json')

wsClient(WS_URL, {
    binary: true,
    onConnect
})

function onConnect (err, wsStream) {
    if (err) return console.log('**errrrrr**', err)

    console.log('** on connect **')

    var manifest = {
        foo: 'async',
        publish: 'async'
    }

    // sbot is rpc client
    // arguments are (remote, local)
    var sbot = muxrpc(manifest, null)()
    var rpcStream = sbot.createStream(function _onClose (err) {
        // if (onClose) onClose(err)
        console.log('closed', err)
    })

    console.log('sbot browser', sbot)

    sbot.foo('ok test', function (err, res) {
        console.log('aaaa in here', err, res)
    })

    S(wsStream, rpcStream, wsStream)
}
