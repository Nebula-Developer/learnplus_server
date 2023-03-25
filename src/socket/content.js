const args = require('../args');
const returns = require('../returns');
const users = require('../users/users');
const fs = require('fs');
const path = require('path');
const paths = require('../paths');

function socketHandler(io) {
    io.addListener('connection', (socket) => {
        socket.on('get', (p, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(p, "string")) return callback(returns.error("Invalid arguments."));

            var realPath = path.resolve(path.join(paths.public, p));
            if (path.dirname(realPath) != paths.public) return callback(returns.error("Invalid path."));

            var content = fs.readFileSync(realPath, 'utf8');
            callback(returns.success(content));
        });
    });
}

module.exports = socketHandler;
