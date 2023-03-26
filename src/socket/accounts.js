const args = require('../args');
const returns = require('../returns');
const users = require('../users/users');

function socketHandler(io) {
    io.addListener('connection', (socket) => {
        socket.on('createAccount', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.username, "string", data.password, "string", data.email, "string")) return callback(returns.error("Invalid arguments."));
            var res = users.createAccount(data.username, data.password, data.email);
            if (res.success && res.data.token) socket.token = res.data.token;
            callback(res);
        });

        socket.on('login', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.username, "string", data.password, "string")) return callback(returns.error("Invalid arguments."));
            var res = users.loginPassword(data.username, data.password);
            if (res.success && res.data.token) socket.token = res.data.token;
            callback(res);
        });

        socket.on('loginToken', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.token, "string", data.username, "string")) return callback(returns.error("Invalid arguments."));
            var res = users.loginToken(data.username, data.token);
            if (res.success && res.data.token) socket.token = res.data.token;
            callback(res);
        });
    });
}

module.exports = socketHandler;
