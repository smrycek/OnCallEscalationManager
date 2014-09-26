


exports.validatePhone = function (value, callback) {
    var pattern = /^\d{10}$/,
        nondigit = /\D/g,
        result = value.replace(nondigit, ""),
        err,
        rtn;

    if (!pattern.test(result)) {
        console.log(value + " = " + result);
        err = new Error('Number did not consist of 10 digits.');
    } else {
        rtn = result;
    }

    callback(err, rtn);
};