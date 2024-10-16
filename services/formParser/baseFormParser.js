class BaseFormParser {
    constructor(config) {
        this.config = config;
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
    BaseFormParser
}