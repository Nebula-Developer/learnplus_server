const crypto = require('crypto');
const fs = require('fs');
const paths = require('../paths');

let keys = [];
if (fs.existsSync(paths.getPrivate('keys.json'))) {
    keys = JSON.parse(fs.readFileSync(paths.getPrivate('keys.json')));
} else {
    for (let i = 0; i < 100; i++) {
        keys.push(crypto.randomBytes(16).toString('hex'));
    }

    fs.writeFileSync(paths.getPrivate('keys.json'), JSON.stringify(keys, null, 4));
}

function getKey() {
    var index = Math.floor(Math.random() * keys.length);
    return {
        key: keys[index],
        index: index
    }
}

function encrypt(str) {
    var iv = crypto.randomBytes(16);
    var key = getKey();
    var cipher = crypto.createCipheriv('aes-256-cbc', key.key, iv);
    
    var encrypted = cipher.update(str);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
        key: key.index,
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    }
}

function decrypt(dat) {
    if (!dat.key || !dat.iv || !dat.encryptedData) return null;

    var iv = Buffer.from(dat.iv, 'hex');
    var encryptedText = Buffer.from(dat.encryptedData, 'hex');
    var decipher = crypto.createDecipheriv('aes-256-cbc', keys[dat.key], iv);
    var decrypted = decipher.update(encryptedText);

    try {
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    } catch {
        return null;
    }

    return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt
}
