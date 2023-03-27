
var error = (message) => {
    return {
        success: false,
        error: message
    };
};

var success = (data) => {
    return {
        success: true,
        data: data
    };
};

class Return {
    /** @type {boolean} */
    success;
    /** @type {object} */
    data;
    /** @type {string} */
    error;
}

module.exports = {
    error,
    success,
    errors: {
        invalidArgs: error("Invalid arguments.")
    },
    Return
}