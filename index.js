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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    console.log("LearnPlus - Socket connected.");
    socket.on('disconnect', () => {
        console.log("LearnPlus - Socket disconnected.");
    });

    socket.on('get', (p, callback) => {
        if (!args.checkCallback(callback)) return;
        if (!args.checkArgs(p, "string")) {
            callback(returns.errors.invalidArgs);
            return;
        }

        var relativePath = path.resolve(path.join(__dirname, 'public', p));

        if (path.dirname(relativePath) !== path.join(__dirname, 'public')) {
            callback(returns.error("Invalid path."));
            return;
        }

        if (!fs.existsSync(relativePath)) {
            callback(returns.error("File not found."));
            return;
        }

        if (fs.statSync(relativePath).isDirectory()) {
            callback(returns.error("Path is a directory."));
            return;
        }

        var content = fs.readFileSync(relativePath, 'utf8');
        callback(returns.success(content));
    });

    socket.on('getPanels', (callback) => {
        if (!args.checkCallback(callback)) return;

        var panels = fs.readdirSync(path.join(__dirname, 'public', 'panels'));
        var panelData = [];

        for (var i = 0; i < panels.length; i++) {
            var panel = panels[i];
            var panelPath = path.join(__dirname, 'public', 'panels', panel);
            var data = fs.readFileSync(panelPath, 'utf8');
            panelData.push({
                name: panel,
                data: data
            });
        }

        callback(returns.success(panelData));
    });
});

server.listen(3002);
