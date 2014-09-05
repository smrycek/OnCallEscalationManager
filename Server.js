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
    var name, phone, fallback;
    console.log("");
    if (!name) {
        promptly.prompt('Application Name: ', function (err, retName) {
            name = retName;
            if (!phone) {
                promptly.prompt('Phone Number: ', { validator: PhoneValidator }, function (err, retPhone) {
                    phone = retPhone;
                    if (!fallback) {
                        promptly.prompt('Fallback Number: ', { validator: PhoneValidator }, function (err, retFallback) {
                            fallback = retFallback;
                            if (name && phone && fallback) {
                                callback(name, phone, fallback);
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
        return value;
    };
}

function promptAction() {
    promptly.prompt("Enter Action: ", function (err, input) {
        if (input.toLowerCase() == 'add') {
            promptApplication(function (name, phone, fallback) {
                console.log(name + " - " + phone + " - " + fallback);
                promptAction();
            });
        } else {
            promptAction();
        }

    });
} 


console.log("On Call Escalation Manager Started");
console.log("----------------------------------")
console.log("Twilio Service is Listening...");
console.log("");
console.log("To add a new application to the database, enter 'add'");
console.log("");

promptAction();