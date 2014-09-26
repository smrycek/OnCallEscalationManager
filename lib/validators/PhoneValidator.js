
// This function takes a phone number and
// checks that it is a valid phone number
//
// Phone numbers should be 10 digits
exports.validatePhone = function (value, callback) {
    var pattern = /^\d{10}$/,
        nondigit = /\D/g,
        result = value.replace(nondigit, ""),
        err,
        rtn;

    if (!pattern.test(result)) {
        err = new Error('Number did not consist of 10 digits.');
    } else {
        rtn = result;
    }

    callback(err, rtn);
};