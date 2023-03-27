const sqlite3 = require('sqlite3').verbose();
const paths = require('../paths');
const fs = require('fs');
const returns = require('../returns');
const { Return } = require('../returns');

if (!fs.existsSync(paths.getPrivate('messages'))) {
    fs.mkdirSync(paths.getPrivate('messages'));
}

const db = new sqlite3.Database(paths.getPrivate('messages/channels.db'));

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, owner TEXT, password TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, channel INTEGER, sender TEXT, content TEXT, time INTEGER)');
});


function createChannel(name, owner, password) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO channels (name, owner, password) VALUES (?, ?, ?)', [name, owner, password], function(err) {
            if (err) resolve(returns.error("An error occurred while creating the channel."));
            else resolve(returns.success({ id: this.lastID, name: name }));
        });
    });
}

function sendMessage(channel, sender, content) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO messages (channel, sender, content, time) VALUES (?, ?, ?, ?)', [channel, sender, content, Date.now()], function(err) {
            if (err) resolve(returns.error("An error occurred while sending the message."));
            else resolve(returns.success({ id: this.lastID, channel: channel, sender: sender, content: content, time: Date.now() }));
        });
    });
}

function getMessages(channel, limit = 50) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM messages WHERE channel = ? ORDER BY id DESC LIMIT ?', [channel, limit], (err, rows) => {
            var channelName = db.get('SELECT name FROM channels WHERE id = ?', [channel]);
            if (err) resolve(returns.error("An error occurred while fetching messages."));
            else resolve(returns.success({
                channel: channel,
                name: channelName,
                messages: rows.reverse()
            }));
        });
    });
}

function getChannel(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM channels WHERE id = ?', [id], (err, row) => {
            if (err) resolve(returns.error("An error occurred while fetching the channel."));
            else resolve(returns.success(row));
        });
    });
}

function getChannels() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM channels', (err, rows) => {
            if (err) resolve(returns.error("An error occurred while fetching channels."));
            else resolve(returns.success(rows));
        });
    });
}

function deleteChannel(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM channels WHERE id = ?', [id], (err) => {
            if (err) resolve(returns.error("An error occurred while deleting the channel."));
            else resolve(returns.success());
        });
    });
}

function deleteMessage(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM messages WHERE id = ?', [id], (err) => {
            if (err) resolve(returns.error("An error occurred while deleting the message."));
            else resolve(returns.success());
        });
    });
}

function deleteMessages(channel) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM messages WHERE channel = ?', [channel], (err) => {
            if (err) resolve(returns.error("An error occurred while deleting messages."));
            else resolve(returns.success());
        });
    });
}

function editMessage(id, content) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE messages SET content = ? WHERE id = ?', [content, id], (err) => {
            if (err) resolve(returns.error("An error occurred while editing the message."));
            else resolve(returns.success());
        });
    });
}

module.exports = {
    createChannel,
    sendMessage,
    getMessages,
    getChannel,
    getChannels,
    deleteChannel,
    deleteMessage,
    deleteMessages,
    editMessage
};
