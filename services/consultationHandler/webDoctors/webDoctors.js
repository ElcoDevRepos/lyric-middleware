const { ConsultationHandler } = require("../base/consultationHandler");
const { WebDoctorConsultationFormParser } = require("./behaviors/parseFormBehavior");
const { WebDoctorsPostProcessor } = require("./behaviors/postProcessBehavior");
const { WebDoctorConsultationRequest } = require("./behaviors/requestSender");

class WebDoctorsConsultationHandler extends ConsultationHandler {
    constructor(config) {
        super(config);

        this.parseFormBehavior = WebDoctorConsultationFormParser; 
        this.sendRequestBehavior = WebDoctorConsultationRequest; 
        this.postProcessBehavior = WebDoctorsPostProcessor; 
    }
}

module.exports = {
    WebDoctorsConsultationHandler
}

