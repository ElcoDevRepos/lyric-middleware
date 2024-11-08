class LyricFormParser {
    constructor(config) {
        this.config = config;
        this.formFields = [
            'modality',
            'state',
            'phoneNumber',
            'pharmacyId',
            'reason_for_visit',
            'translate',
            'whenScheduled',
            'timezoneOffset',
            'chiefComplaint',
            'otherProblems',
            'roi',
            'userId',
            'prescriptionRefillNeeded',
            'consultationType',
            'provider_id',
            'time_slot_id',
            'questionnaires'
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

        console.log("data form: ", data.time_slot_id)
        return data;
    }
}

module.exports = {
    LyricFormParser
}