// Date Util is a set of functions to make dealing with date objects easier.
//
//The first date is always the date being compared to.
//
//Tested in TestDateUtils.js

exports.before = function (date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    var diff = date1.getTime() < date2.getTime();
    if (diff == 1) {
        return true;
    }
    return false;
};

exports.after = function (date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    var diff = date1.getTime() > date2.getTime();
    if (diff == 1) {
        return true;
    }
    return false;
};

exports.equal = function (date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    var diff = date1.getTime() === date2.getTime();
    if (diff == 1) {
        return true;
    }
    return false;
};

exports.between = function (check, sDate, eDate) {
    check.setHours(0, 0, 0, 0);
    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(0, 0, 0, 0);
    if(this.before(check, eDate) && this.after(check, sDate)){
        return true;
    } else if (this.equal(check, eDate) || this.equal(check, sDate)) {
        return true;
    }
    return false;
}