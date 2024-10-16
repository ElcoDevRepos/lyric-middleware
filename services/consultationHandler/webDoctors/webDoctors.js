const { ConsultationHandler } = require("../base/consultationHandler");

class WebDoctorsConsultationHandler extends ConsultationHandler {
    constructor(config) {
        super(config);
    }
}

module.exports = {
    WebDoctorsConsultationHandler
}

