const { BaseFormParser } = require("../../../formParser/baseFormParser");

class WebDoctorConsultationFormParser extends BaseFormParser {
    constructor(config) {
        super(config);

        this.formFields = [
            'email',
            'reasonId',
            'symptomIds',
            'createdBy'
        ];
    }
}

module.exports = {
    WebDoctorConsultationFormParser
}