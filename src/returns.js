
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

module.exports = {
    error,
    success,
    errors: {
        invalidArgs: error("Invalid arguments.")
    }    
}