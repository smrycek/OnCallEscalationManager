// This is a function for validating a staff
// member. currently the only things being checked
// is that the name is not empty.
exports.validateStaff = function (staff, callback) {
    var err;
    // check name is not empty
    if (!staff.Name || staff.Name == "") {
        err = new Error("The name of an staff cannot be of zero length.");
        callback(err, staff);
    } else {
        callback(err, staff);
    }
}