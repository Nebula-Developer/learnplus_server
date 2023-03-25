const args = require('../args');
const returns = require('../returns');
const users = require('../users/users');

function socketHandler(io) {
    io.addListener('connection', (socket) => {
        socket.on('createAccount', async (data, callback) => {
            if (!args.checkCallback(callback)) return;

            if (!args.checkArgs(data.username, "string", data.password, "string", data.email, "string")) {
                callback(returns.error("Invalid arguments."));
                return;
            }

            if (data.username.length < 3 || data.username.length > 16) {
                callback(returns.error("Username must be between 3 and 16 characters."));
                return;
            }

            if (data.password.length < 8 || data.password.length > 32) {
                callback(returns.error("Password must be between 8 and 32 characters."));
                return;
            }

            if (data.email.length < 5 || data.email.length > 32) {
                callback(returns.error("Email must be between 5 and 32 characters."));
                return;
            }

            if (!checkEmail(data.email)) {
                callback(returns.error("Invalid email."));
                return;
            }
            
            callback(users.createAccount(data.username, data.password, data.email));
        });
    });
}

function checkEmail(email) {
    return email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
}

module.exports = socketHandler;
