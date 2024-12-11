class VerifyWebdoctorsConsultationForm {
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
    VerifyWebdoctorsConsultationForm
}