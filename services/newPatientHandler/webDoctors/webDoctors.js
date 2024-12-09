const { NewPatientHandler } = require("../base/newPatientHandler");
const { WebDoctorPatientFormParser } = require("./behaviors/parseFormBehavior");
const { VerifyWebDoctorsPatientForm } = require("./behaviors/verifyFormBehavior");
const { WebDoctorsPostProcessor } = require("./behaviors/webDoctorsPostProcessor");
const { WebDoctorPatientRequest } = require("./behaviors/webDoctorsRequestSender");

class WebDoctorsNewPatientHandler extends NewPatientHandler {
    constructor(config) {
        super(config);

        this.verifyFormBehavior = VerifyWebDoctorsPatientForm;
        this.parseFormBehavior = WebDoctorPatientFormParser; 
        this.sendRequestBehavior = WebDoctorPatientRequest; 
        this.postProcessBehavior = WebDoctorsPostProcessor; 
    }
}

module.exports = {
    WebDoctorsNewPatientHandler
}

