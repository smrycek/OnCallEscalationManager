var mongoose = require('mongoose'),
    nconf = require('nconf'),
    promptly = require('promptly');

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

var name, phone, fallback;

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
                            //Add to database here. For now, we will simply print them.
                            console.log(name + " - " + phone + " - " + fallback);
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
