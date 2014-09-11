var baseTWIMLStart = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>',
    baseTWIMLEnd = '</Response>';

exports.Dial = function (phoneNumber, timeout, action, method, callerID) {
    var dialTWIML = baseTWIMLStart;
    dialTWIML += '<Dial timeout="' + timeout + '" action="' + action + '" method="' + method + '" callerId="' + callerID + '">' + phoneNumber + '</Dial>';
    dialTWIML += baseTWIMLEnd;
    
    return dialTWIML;    
};