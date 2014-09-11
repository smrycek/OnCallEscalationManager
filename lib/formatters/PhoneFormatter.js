
// This function takes a phone number supplied through twilio's post request
// and converts it to a format that is consistent with our database.
//
// Example: +19194913313 -> 919-491-3313
exports.twilioToDatabase = function (twilioNumber) {
    var phoneLength = 10;
    //Start - +19194913313
    twilioNumber = right(twilioNumber, phoneLength);
    //Current - 9194913313
    twilioNumber = twilioNumber.substring(0, 3) + "-" + twilioNumber.substring(3);
    //Current - 919-4913313
    twilioNumber = twilioNumber.substring(0, 7) + "-" + twilioNumber.substring(7);
    //Current - 919-491-3313
    return twilioNumber
}

//This function returns the right x characters of a string.
function right(str, len) {
    return str.substring(str.length - len);
}