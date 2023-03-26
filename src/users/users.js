const fs = require('fs');
const paths = require('../paths');
const returns = require('../returns');
const crypto = require('crypto');
const encrypt = require('./encrypt');
const User = require('./user');

const __users = paths.getPrivate('users.json');

function getUsers() {
    return JSON.parse(fs.readFileSync(__users));
}

function writeUsers(users) {
    fs.writeFileSync(__users, JSON.stringify(users, null, 4));
}

if (!fs.existsSync(__users)) writeUsers([]);

function getUsersFrom(data) {
    let users = getUsers();
    let keys = Object.keys(data);

    return users.filter((user) => {
        for (let i = 0; i < keys.length; i++) {
            if (user[keys[i]] !== data[keys[i]]) return false;
        }
        return true;
    });
}

function getUserFrom(data) {
    let users = getUsersFrom(data);
    return users.length > 0 ? users[0] : null;
}

function userExists(data) {
    return getUsersFrom(data).length > 0;
}

const checkEmail = (email) => email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);

function createAccount(username, password, email) {
    if (userExists({ username })) return returns.error("Username already exists.");
    if (userExists({ email })) return returns.error("Email is already in use.");

    if (username.length < 3 || username.length > 16) return returns.error("Username must be between 3 and 16 characters.");
    if (password.length < 4 || password.length > 32) return returns.error("Password must be between 4 and 32 characters.");
    if (email.length < 5 || email.length > 32) return returns.error("Email must be between 5 and 32 characters.");
    if (!checkEmail(email)) return returns.error("Invalid email.");

    let users = getUsers();
    let user = {
        username,
        password: encrypt.encrypt(password),
        email,
        id: crypto.randomBytes(16).toString('hex') + Date.now(),

        reset: {
            code: null,
            expires: null
        },

        verify: {
            code: null,
            verified: false
        },

        created: Date.now(),
        lastLogin: null,
        tokens: [],

        settings: {
            theme: 'default',
            language: 'en',
            notifications: 'mentions'
        },

        friends: [],
        data: {}
    };

    var t = user.pushToken();

    users.push(user);
    writeUsers(users);

    return returns.success(safeUser(user));
}

function safeUser(user) {
    let safe = Object.assign({}, user);
    delete safe.password;
    safe.token = user.tokens[user.tokens.length - 1] || user.pushToken();
    delete safe.tokens;
    return safe;
}

Object.prototype.pushToken = function() {
    var token = crypto.randomBytes(16).toString('hex') + Date.now() + crypto.randomBytes(16).toString('hex');
    this.tokens.push(token);
    if (this.tokens.length > 5) this.tokens.shift();
    return token;
}

function getUserIndexFrom(data) {
    let users = getUsers();
    let keys = Object.keys(data);

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        for (let j = 0; j < keys.length; j++) {
            if (user[keys[j]] !== data[keys[j]]) break;
            if (j === keys.length - 1) return i;
        }
    }

    return -1;
}

function loginPassword(username, password) {
    let userIndex = getUserIndexFrom({ username });
    if (userIndex === -1) return returns.error("Invalid username or password.");

    let users = getUsers();
    let user = users[userIndex];

    let pass = encrypt.decrypt(user.password);
    if (pass !== password) return returns.error("Invalid username or password.");

    user.lastLogin = Date.now();
    user.pushToken();

    users[userIndex] = user;
    writeUsers(users);

    return returns.success(safeUser(user));
}

function loginToken(username, token) {
    let userIndex = getUserIndexFrom({ username });
    if (userIndex === -1) return returns.error("Invalid username or token.");

    let users = getUsers();
    let user = users[userIndex];

    if (!user.tokens.includes(token)) return returns.error("Invalid username or token.");
    user.lastLogin = Date.now();

    users[userIndex] = user;
    writeUsers(users);

    return returns.success(safeUser(user));
}

function getUser(id) {
    let user = getUsersFrom({ id })[0];
    if (!user) return returns.error("Invalid user.");
    return returns.success(safeUser(user));
}

function createTestAccount() {
    var testCreate = createAccount('test', 'test_learnplus_account', 'test@test.com');
    console.log(testCreate.success);
    
    var testLogin = loginPassword('test', 'test_learnplus_account');
    console.log(testLogin.success);

    if (!testLogin.success) return console.log(false);

    var testLoginToken = loginToken('test', testLogin.data.token);
    console.log(testLoginToken.success);
}

function modifyAccount(id, data) {
    let userIndex = getUserIndexFrom({ id });
    if (userIndex === -1) return returns.error("Invalid user.");

    let users = getUsers();
    let user = users[userIndex];

    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        user[keys[i]] = data[keys[i]];
    }

    users[userIndex] = user;
    writeUsers(users);
    return returns.success(safeUser(user));
}

module.exports = {
    getUser,
    getUsers,
    getUsersFrom,
    getUserFrom,
    userExists,
    createAccount,
    loginPassword,
    loginToken,
    modifyAccount
};
