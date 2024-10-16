class WebDoctorFormParser {
    constructor(config) {
        this.config = config;

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

    async parse() {
        const data = new FormData();
        const form = this.config.form;
        this.formFields.forEach((field)=>{
            if(form[field]) {
                data.append(field, form[field]);
            }
        });

        return form;
    }
}

module.exports = {
    WebDoctorFormParser
}