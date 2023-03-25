const path = require('path');

const root = require.main.path;
const public = path.join(root, 'public');
const private = path.join(root, 'private');

module.exports = {
    root,
    public,
    private,
    getRoot: (p) => path.join(root, p),
    getPublic: (p) => path.join(public, p),
    getPrivate: (p) => path.join(private, p)
};
