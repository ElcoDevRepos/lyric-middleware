const { lyricLogin } = require("../../../../lib/lyric/auth");

class LyricFormParser {
    constructor(config) {
        this.config = config;

        this.formFields = [
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
            'memberExternalId',
            'state',
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
        let data = {};
        const form = this.config.form;
        this.formFields.forEach((field)=>{
            if(form[field]) {
                data[field] = form[field];
            }
        });

        return data;
    }
}

module.exports = {
    LyricFormParser
}