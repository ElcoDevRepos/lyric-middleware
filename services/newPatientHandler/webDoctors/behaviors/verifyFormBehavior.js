const { getAddressDetailsFromZip } = require("../../../../lib/google/getCity");

class VerifyWebDoctorsPatientForm {
    constructor(config) {
        this.config = config;
    }
    async verifyForm() {
        const verifiedZip = await this.verifyAddress();
        if(verifiedZip?.error) {
            return verifiedZip;
        }
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

    async verifyAddress() {
        const form = this.config?.form;

        let zip = "";
        let addressComponents = null;

        if(!form.zip) {
            return {
                error: {
                    code: 400,
                    message: "No Zip provided"
                }
            }
        }

        if (form.zip) {
            zip = form.zip.split("-")[0];
            try {
                addressComponents = await getAddressDetailsFromZip(zip);
            } catch (e) {
                console.log(e);
                return {
                    error: {
                        code: 400,
                        message: "invalid zip / address"
                    }
                }
            }
        }
    }
}

module.exports = {
    VerifyWebDoctorsPatientForm
}