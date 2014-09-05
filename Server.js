var mongoose = require('mongoose'),
    nconf = require('nconf'),
    promptly = require('promptly')

//NConf Configuration
nconf.env().file({ file: 'settings.json' });

//Mongoose Configuration
mongoose.connect('mongodb://' + nconf.get('database:db_user') + ':' + nconf.get('database:db_pass') + '@kahana.mongohq.com:10070/app28953073');
mongoose.connection.once('connected', function() {
    //console.log("Database connected");
});
mongoose.connection.once('error', function() {
    //console.log("Database Error");
});


function promptApplication(callback) {
    var name, phone, fallbackName, fallbackNumber;
    console.log("");
    console.log("Add New Application");
    console.log("-------------------");
    if (!name) {
        promptly.prompt('Application Name: ', function (err, retName) {
            name = retName;
            if (!phone) {
                promptly.prompt('Phone Number: ', { validator: PhoneValidator }, function (err, retPhone) {
                    phone = retPhone;
                    if (!fallbackName) {
                        promptly.prompt('Fallback Name: ', function (err, retFallback) {
                            fallbackName = retFallback;
                            if (!fallbackNumber) {
                                promptly.prompt('Fallback Number: ', { validator: PhoneValidator }, function (err, retFallback) {
                                    fallbackNumber = retFallback;
                                    if (name && phone && fallbackName && fallbackNumber) {
                                        console.log("");
                                        callback(name, phone, fallbackName, fallbackNumber);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    var PhoneValidator = function (value) {
        var pattern = /^\d{3}-\d{3}-\d{4}/;
        if (!pattern.test(value)) {
            throw new Error('Phone number must be in the form:\n###-###-####');
        }

        if (phone) {
            //If phone is set, we are entering the fallback number. These 2 numbers cannot be the same or an infinite call loop may occur. (if thats even possible)
            if (phone == value) {
                throw new Error('Fallback number cannot be the same as the application number.');
            }
        }


        return value;
    };
}

function promptAction() {
    promptly.prompt("Enter Action: ", function (err, input) {
        if (input.toLowerCase() == 'add') {
            promptApplication(function (name, phone, fallbackName, fallbackPhone) {
                console.log(name + " - " + phone + " - " + fallbackName + " - " + fallbackPhone);
                console.log("");
                promptAction();
            });
        } else if (input.toLowerCase() == 'exit') {
            process.exit();
        } else {
            promptAction();
        }

    });
} 


console.log("");
console.log("On Call Escalation Manager Started");
console.log("----------------------------------")
console.log("Twilio Service is Listening...");
console.log("");
console.log("To add a new application to the database, enter 'add'");
console.log("To exit the application, enter 'exit'");
console.log("");

promptAction();