class VerifyWebDoctorsPatientForm {
    constructor(config) {
        this.config = config;
    }
    async verifyForm() {
        const date_of_birth = this.config?.form?.date_of_birth;
        if (!date_of_birth) {
            return {
                error: {
                    code: 400,
                    message: "Date of birth is required."
                }
            };
        }
    
        const birthDate = new Date(date_of_birth);
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();

        // If the user hasn't had their birthday this year yet, subtract 1 from the age
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            return {
                error: {
                    code: 400,
                    message: "You must be 18 years or older to submit this form."
                }
            };
        }

        return {
            isValid: true
        }
    }
}

module.exports = {
    VerifyWebDoctorsPatientForm
}