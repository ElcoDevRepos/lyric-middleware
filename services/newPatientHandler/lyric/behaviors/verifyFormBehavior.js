const { getAddressDetailsFromZip } = require("../../../../lib/google/getCity");

class VerifyLyricPatientForm {
    constructor(config) {
        this.config = config;
    }
    async verifyForm() {
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
        return {
            isValid: true
        }
    }
}

module.exports = {
    VerifyLyricPatientForm
}