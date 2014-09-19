var baseTWIMLStart = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n',
    baseTWIMLEnd = '</Response>';

exports.Start = function () {
    return baseTWIMLStart;
}

exports.End = function () {
    return baseTWIMLEnd;
}

exports.OpenDial = function (dialParams) {
    var dialTwiml = '<Dial ';
    if (dialParams.timeout)
        dialTwiml += 'timeout="' + dialParams.timeout + '" ';
    if (dialParams.action)
        dialTwiml += 'action="' + dialParams.action + '" ';
    if (dialParams.method)
        dialTwiml += 'method="' + dialParams.method + '" ';
    if (dialParams.callerID)
        dialTwiml += 'callerId="' + dialParams.callerID + '" ';
    dialTwiml += ">\n";
    dialTwiml += dialParams.phoneNumber + "\n";


    return dialTwiml;
};

exports.CloseDial = function () {
    return '</Dial>';
}

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

exports.Conference = function (conferenceParams) {
    var confTwiml = '<Conference ';
    if (conferenceParams.muted)
        confTwiml += 'muted="' + conferenceParams.muted + '" ';
    if (conferenceParams.beep)
        confTwiml += 'beep="' + conferenceParams.beep + '" ';
    if (conferenceParams.startConferenceOnEnter)
        confTwiml += 'startConferenceOnEnter="' + conferenceParams.startConferenceOnEnter + '" ';
    if (conferenceParams.endConferenceOnExit)
        confTwiml += 'endConferenceOnExit="' + conferenceParams.endConferenceOnExit + '" ';
    if (conferenceParams.waitUrl)
        confTwiml += 'waitUrl="' + conferenceParams.waitUrl + '" ';
    if (conferenceParams.waitMethod)
        confTwiml += 'waitMethod="' + conferenceParams.waitMethod + '" ';
    if (conferenceParams.maxParticipants)
        confTwiml += 'maxParticipants="' + conferenceParams.maxParticipants + '" ';
    if (conferenceParams.record)
        confTwiml += 'record="' + conferenceParams.record + '" ';
    if (conferenceParams.eventCallbackUrl)
        confTwiml += 'eventCallbackUrl="' + conferenceParams.eventCallbackUrl + '" ';
    confTwiml += ">";

    if (conferenceParams.Name)
        confTwiml += conferenceParams.Name;

    confTwiml += "</Conference>";
    return confTwiml;
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
    return errorTwiml;
}