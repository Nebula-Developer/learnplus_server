const fs = require('fs');
const paths = require('../paths');
const returns = require('../returns');
const crypto = require('crypto');
const encrypt = require('./encrypt');

const __users = paths.getPrivate('users.json');

var en = encrypt.encrypt('test');
console.log(en);
console.log(encrypt.decrypt(en));
