


exports.validatePhone = function (value) {
    var valid = false;
    var pattern = /^\d{3}-\d{3}-\d{4}/;
    var result = value.replace("[^0-9]", "");

    if (!pattern.test(value)) {
        throw new Error('Phone number must be in the form:\n###-###-####');
    }

    if (app.phone) {
        //If phone is set, we are entering the fallback number. These 2 numbers cannot be the same or an infinite call loop may occur. (if thats even possible)
        if (app.phone == value) {
            throw new Error('Fallback number cannot be the same as the application number.');
        }
    }


    return value;
};