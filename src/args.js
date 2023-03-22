
module.exports = {
    checkArgs: function (...args) {
        if (typeof args !== "object") return false;
        if (args.length % 2 !== 0) return false;

        for (let i = 0; i < args.length; i += 2)
            if (typeof args[i] !== args[i + 1]) return false;

        return true;
    },
    checkCallback: function (callback) {
        return typeof callback === "function";
    }
}