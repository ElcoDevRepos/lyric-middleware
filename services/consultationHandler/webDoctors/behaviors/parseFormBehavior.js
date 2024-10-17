const { BaseFormParser } = require("../../../formParser/baseFormParser");

class WebDoctorConsultationFormParser extends BaseFormParser {
    constructor(config) {
        super(config);

        this.formFields = [
            'patientId',
            'reasonId',
            'symptomIds',
            'createdBy'
        ];
    }
}

module.exports = {
    WebDoctorConsultationFormParser
}