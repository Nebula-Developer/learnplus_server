const sqlite3 = require('sqlite3').verbose();
const paths = require('../paths');
const fs = require('fs');

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
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function sendMessage(channel, sender, content) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO messages (channel, sender, content, time) VALUES (?, ?, ?, ?)', [channel, sender, content, Date.now()], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function getMessages(channel, limit = 50) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM messages WHERE channel = ? ORDER BY id DESC LIMIT ?', [channel, limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.reverse());
        });
    });
}

function getChannel(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM channels WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getChannels() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM channels', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function deleteChannel(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM channels WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function deleteMessage(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM messages WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function deleteMessages(channel) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM messages WHERE channel = ?', [channel], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function editMessage(id, content) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE messages SET content = ? WHERE id = ?', [content, id], (err) => {
            if (err) reject(err);
            else resolve();
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
