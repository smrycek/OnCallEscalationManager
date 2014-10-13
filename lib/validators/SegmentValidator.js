var dateUtil = require('../utils/DateUtil.js');

// This function takes an application and a segment
//
// validates the segment's start date is before or same as end date.
//
// validates the segments has no overlap with the applications segments.
exports.validateSegment = function (application, newSegment, callback) {
    var err;
    //set hours,mins,seconds, milliseconds to 0 for the new segment
    newSegment.StartDate.setHours(0, 0, 0, 0);
    newSegment.EndDate.setHours(0, 0, 0, 0);
    //
    if (dateUtil.after(newSegment.StartDate, newSegment.EndDate)) {
        err = new Error("End Date cannont be before Start Date.");
        callback(err, newSegment);
    }
    //console.log(application.Segments);
    // Loop through segments and see if there is any overlap
    application.Segments.forEach(function (s) {
        var startDate = s.StartDate;
        var endDate = s.EndDate;
        endDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        // check if new segments start date is inside other segment
        if (dateUtil.between(newSegment.StartDate, startDate, endDate) || dateUtil.between(newSegment.EndDate, startDate, endDate)) {
            err = new Error("Segment has overlap with segments already on record.");
            callback(err, newSegment);
        }
    });
    callback(err, newSegment);
};