const { NewPatientHandler } = require("../base/newPatientHandler");

class WebDoctorsNewPatientHandler extends NewPatientHandler {
    constructor(config) {
        super(config);
    }
}

module.exports = {
    WebDoctorsNewPatientHandler
}

