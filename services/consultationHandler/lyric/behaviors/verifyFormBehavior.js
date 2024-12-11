class VerifyLyricConsultationForm {
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
    VerifyLyricConsultationForm
}