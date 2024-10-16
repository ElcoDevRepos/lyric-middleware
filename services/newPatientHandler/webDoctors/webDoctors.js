const { NewPatientHandler } = require("../base/newPatientHandler");
const { WebDoctorPatientFormParser } = require("./behaviors/parseFormBehavior");
const { WebDoctorsPostProcessor } = require("./behaviors/webDoctorsPostProcessor");
const { WebDoctorPatientRequest } = require("./behaviors/webDoctorsRequestSender");

class WebDoctorsNewPatientHandler extends NewPatientHandler {
    constructor(config) {
        super(config);

        this.parseFormBehavior = WebDoctorPatientFormParser; 
        this.sendRequestBehavior = WebDoctorPatientRequest; 
        this.postProcessBehavior = WebDoctorsPostProcessor; 
    }
}

module.exports = {
    WebDoctorsNewPatientHandler
}

