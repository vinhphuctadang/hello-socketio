var app = require('express')();
var socketio = require('socket.io')

function main() {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html')
    });

    app.get('/sock-echo', (req, res)=>{
        // route makes this server work like an 'echo server' but using socket style
        req.app.io.emit('details', 'Server accepts your request by showing this message')
    })
    
    // listening for client requests
    http = app.listen(8888, () => {
        console.log('listening on *:8888');
    });
    
    let io = socketio(http)
    // set working socket io
    app.io = io

    io.use( 
        (socket, next) => {
            if (socket.handshake.query) {
                var token = socket.handshake.query.token;
                console.log('Received token:', socket.handshake.query)
                if (token === 'ShouldAllowMe'){
                    console.log('Allow him')
                    socket.payload = token 
                    next()
                    return 
                }
            }
            next(new Error('Authentication error'))
        }
    );
    // handle connections
    io.on('connection', (socket) => {
        console.log('A connection established with socket payload:', socket.payload)
        // join defaultRoom
        socket.join('defaultRoom')
        // only emit to the default Room
        io.to('defaultRoom').emit('incoming message', 'You joined "default room"')
    });
}

main()

// client request should be:
// socket = io.connect('http://localhost:8888', {
//   query: 'token=' + validToken,
//   forceNew: true
// });