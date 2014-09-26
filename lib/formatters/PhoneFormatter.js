
// This function takes a phone number supplied through twilio's post request
// and converts it to a format that is consistent with our database.
//
// Example: +19194913313 -> (919) 491-3313
exports.twilioToDatabase = function (twilioNumber) {
    var phoneLength = 10;
    //Start - +19194913313
    twilioNumber = right(twilioNumber, phoneLength);
    //Current - 9194913313
    twilioNumber = this.digitsToDatabase(twilioNumber);
    return twilioNumber
}

// This function takes a phone number in the form of 10 digits
// and converts them to the format that is consistant with our database.
//
// Example: 9194913313 -> (919) 491-3313
exports.digitsToDatabase = function (digits) {
    //Start - 9194933313
    digits = "(" + digits.substring(0, 3) + ")" + " " + digits.substring(3);
    //Current - (919) 4933313
    digits = digits.substring(0, 9) + "-" + digits.substring(9);
    //Final - (919) 493-3313
    return digits;
}

//This function returns the right x characters of a string.
function right(str, len) {
    return str.substring(str.length - len);
}