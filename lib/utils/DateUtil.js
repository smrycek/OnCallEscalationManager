var moment = require('moment');

// Date Util is a set of functions to make dealing with date objects easier.
//
//The first date is always the date being compared to.
//
//Tested in TestDateUtils.js

exports.between = function (check, sDate, eDate) {
    check = new moment(check).hours(0);
    sDate = new moment(sDate).hours(0);
    eDate = new moment(eDate).hours(0);
    if(check.isBefore(eDate) && check.isAfter(sDate)){
        return true;
    } else if (check.isSame(eDate) || check.isSame(sDate)) {
        return true;
    }
    return false;
}