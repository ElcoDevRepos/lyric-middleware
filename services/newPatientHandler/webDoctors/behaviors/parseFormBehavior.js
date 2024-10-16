const { BaseFormParser } = require("../../../formParser/baseFormParser");

class WebDoctorPatientFormParser extends BaseFormParser {
    constructor(config) {
        super(config);

        this.formFields = [
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
            'memberExternalId',
            'state',
            'groupCode',
            'planId',
            'planDetailsId',
            'heightFeet',
            'heightInches',
            'weight',
            'email',
            'phone',
            'address',
            'address2',
            'state',
            'zip',
            'city',
        ];
    }
}

module.exports = {
    WebDoctorPatientFormParser
}