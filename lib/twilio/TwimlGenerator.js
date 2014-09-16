var baseTWIMLStart = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>',
    baseTWIMLEnd = '</Response>';

exports.Start = function () {
    return baseTWIMLStart;
}

exports.End = function () {
    return baseTWIMLEnd;
}

exports.Dial = function (dialParams) {
    var dialTwiml = '<Dial ';
    if (dialParams.timeout)
        dialTwiml += 'timeout="' + dialParams.timeout + '" ';
    if (dialParams.action)
        dialTwiml += 'action="' + dialParams.action + '" ';
    if (dialParams.method)
        dialTwiml += 'method="' + dialParams.method + '" ';
    if (dialParams.callerID)
        dialTwiml += 'callerId="' + dialParams.callerID + '" ';
    dialTwiml += ">";

    if (dialParams.phoneNumber)
        dialTwiml += dialParams.phoneNumber;

    dialTwiml += '</Dial>\n';

    return dialTwiml;
};

exports.OpenGather = function (gatherParams) {
    var gatherTwiml = '<Gather ';
    if (gatherParams.timeout)
        gatherTwiml += 'timeout="' + gatherParams.timeout + '" ';
    if (gatherParams.action)
        gatherTwiml += 'action="' + gatherParams.action + '" ';
    if (gatherParams.method)
        gatherTwiml += 'method="' + gatherParams.method + '" ';
    if (gatherParams.finishOnKey)
        gatherTwiml += 'finishOnKey="' + gatherParams.finishOnKey + '" ';
    if (gatherParams.numDigits)
        gatherTwiml += 'numDigits="' + gatherParams.numDigits + '" ';
    gatherTwiml += ">\n";

    return gatherTwiml;
};

exports.CloseGather = function () {
    return '</Gather>';
}

exports.Say = function (message) {
    var sayTwiml = '<Say voice="man">';
    sayTwiml += message;
    sayTwiml += '</Say>\n'
    return sayTwiml;
}

exports.Hangup = function () {
    return '<Hangup/>';
}

exports.Error = function (message) {
    var errorTwiml = this.Say(message);
    errorTwiml += this.Hangup();
}