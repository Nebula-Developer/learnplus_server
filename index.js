const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname + '/public'));

const io = socketIO(server, {
    cors: {
        origin: '*',
        allowedHeaders: '*',
        credentials: true
    },
    transports: ['websocket', 'polling']
});

server.listen(3002);
