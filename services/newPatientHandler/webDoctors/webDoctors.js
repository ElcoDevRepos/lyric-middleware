const { NewPatientHandler } = require("../base/newPatientHandler");
const { WebDoctorFormParser } = require("./behaviors/parseFormBehavior");
const { WebDoctorsPostProcessor } = require("./behaviors/webDoctorsPostProcessor");
const { WebDoctorsRequestSender } = require("./behaviors/webDoctorsRequestSender");

class WebDoctorsNewPatientHandler extends NewPatientHandler {
    constructor(config) {
        super(config);

        this.parseFormBehavior = WebDoctorFormParser; 
        this.sendRequestBehavior = WebDoctorsRequestSender; 
        this.postProcessBehavior = WebDoctorsPostProcessor; 
    }
}

module.exports = {
    WebDoctorsNewPatientHandler
}

