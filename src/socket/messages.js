const args = require('../args');
const returns = require('../returns');
const users = require('../users/users');
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const channels = require('../messages/channels');

function socketHandler(io) {
    io.addListener('connection', (socket) => {
        function getSocketAccount() {
            console.log(socket.token)
            if (!socket.token) return returns.error("You must be logged in to perform this action.");
            return users.fromToken(socket.token);
        }

        socket.on('createChannel', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.name, "string")) return callback(returns.error("Invalid arguments."));

            var account = getSocketAccount();
            if (!account.success) return callback(returns.error("You must be logged in to create a channel."));

            var res = await channels.createChannel(data.name, account.data.id, data.password);
            callback(res);
        });

        socket.on('joinChannel', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.id, "string")) return callback(returns.error("Invalid arguments."));

            var account = getSocketAccount();
            if (!account.success) return callback(returns.error("You must be logged in to join a channel."));

            var fetchChannels = await channels.getChannels();
            var fetchChannel = fetchChannels.find((c) => c.id == data.id);
            if (!fetchChannel) return callback(returns.error("Invalid channel."));

            if (fetchChannel.password) {
                if (!data.password) return callback(returns.error("This channel requires a password."));
                if (fetchChannel.password != data.password) return callback(returns.error("Invalid password."));
            }

            socket.join(data.id);
            var tUsers = users.getUsers();
            var tUser = tUsers.find((u) => u.id == account.data.id);

            if (tUser) {
                tUser.channels.push(data.id);
            }

            users.writeUsers(tUsers);
            callback(returns.success(await channels.getMessages(data.id, 50)));
        });

        socket.on('leaveChannel', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.id, "string")) return callback(returns.error("Invalid arguments."));

            var account = getSocketAccount();
            if (!account.success) return callback(returns.error("You must be logged in to leave a channel."));

            var fetchChannels = await channels.getChannels();
            var fetchChannel = fetchChannels.find((c) => c.id == data.id);
            if (!fetchChannel) return callback(returns.error("Invalid channel."));

            socket.leave(data.id);
            var tUsers = users.getUsers();
            var tUser = tUsers.find((u) => u.id == account.data.id);

            if (tUser) {
                tUser.channels = tUser.channels.filter((c) => c != data.id);
            }

            users.writeUsers(tUsers);
            callback(returns.success());
        });

        socket.on('sendMessage', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.id, "string", data.message, "string")) return callback(returns.error("Invalid arguments."));

            var account = getSocketAccount();
            if (!account.success) return callback(returns.error("You must be logged in to send a message."));
            if (!socket.rooms.has(data.id)) return callback(returns.error("You must be in this channel to send a message."));
            if (data.message.length > 1000) return callback(returns.error("Message is too long."));
            if (data.message.trim().length == 0) return callback(returns.error("Message is empty."));

            var fetchChannels = await channels.getChannels();
            var fetchChannel = fetchChannels.find((c) => c.id == data.id);
            if (!fetchChannel) return callback(returns.error("Invalid channel."));

            var res = await channels.sendMessage(data.id, account.data.id, data.message);

            io.to(data.id).emit('newMessage', {
                id: res,
                channel: data.id,
                user: account.data.id,
                username: account.data.username,
                message: data.message,
                time: Date.now()
            });
            
            callback(returns.success(res));
        });

        socket.on('getMessages', async (data, callback) => {
            if (!args.checkCallback(callback)) return;
            if (!args.checkArgs(data.id, "string", data.amount, "number")) return callback(returns.error("Invalid arguments."));

            var account = getSocketAccount();
            if (!account.success) return callback(returns.error("You must be logged in to get messages."));
            if (!socket.rooms.has(data.id)) return callback(returns.error("You must be in this channel to get messages."));

            var fetchChannels = await channels.getChannels();
            var fetchChannel = fetchChannels.find((c) => c.id == data.id);
            if (!fetchChannel) return callback(returns.error("Invalid channel."));

            var res = await channels.getMessages(data.id, data.amount);
            
            var outData = [];

            for (var i = 0; i < res.length; i++) {
                var tUser = users.getUser(res[i].sender);
                if (!tUser.success) continue;
                outData.push({
                    id: res[i].id,
                    channel: data.id,
                    user: res[i].user,
                    username: tUser.data.username,
                    message: res[i].content,
                    time: res[i].time
                });
            }

            callback(returns.success(outData));
        });
    });
}

module.exports = socketHandler;
