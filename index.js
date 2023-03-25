const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');
const args = require('./src/args');
const returns = require('./src/returns');

const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const io = socketIO(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket', 'polling']
});

const socketAccounts = require('./src/socket/accounts');
socketAccounts(io);

const socketContent = require('./src/socket/content');
socketContent(io);

server.listen(3002);
