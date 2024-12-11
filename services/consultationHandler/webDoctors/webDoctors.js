const { ConsultationHandler } = require("../base/consultationHandler");
const { WebDoctorConsultationFormParser } = require("./behaviors/parseFormBehavior");
const { WebDoctorsPostProcessor } = require("./behaviors/postProcessBehavior");
const { WebDoctorConsultationRequest } = require("./behaviors/requestSender");
const { VerifyWebdoctorsConsultationForm } = require("./behaviors/verifyFormBehavior");

class WebDoctorsConsultationHandler extends ConsultationHandler {
    constructor(config) {
        super(config);

        this.verifyFormBehavior = VerifyWebdoctorsConsultationForm;
        this.parseFormBehavior = WebDoctorConsultationFormParser; 
        this.sendRequestBehavior = WebDoctorConsultationRequest; 
        this.postProcessBehavior = WebDoctorsPostProcessor; 
    }
}

module.exports = {
    WebDoctorsConsultationHandler
}

