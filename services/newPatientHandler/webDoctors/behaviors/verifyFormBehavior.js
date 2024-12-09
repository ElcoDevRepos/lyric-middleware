class VerifyWebDoctorsPatientForm {
    constructor(config) {
        this.config = config;
    }
    async verifyForm() {
        return {
            isValid: true
        }
    }
}

module.exports = {
    VerifyWebDoctorsPatientForm
}