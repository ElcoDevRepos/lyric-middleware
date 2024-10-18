const { getCityName } = require("../../../../lib/google/getCity");
const { sendLyricAuthenticatedRequest } = require("../../../../lib/lyric/authRequest")

class LyricRequestSender {
    constructor(config) {
        this.config = config
    }

    async create() {
        const form = this.config.form;

        let city = form.city;
        let zip = "";
        if (form.zip) {
            zip = form.zip.split("-")[0];
        }
        if (!city && zip) {
            city = await getCityName(zip);
            city = city.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        } else if (!city && !zip) {
            throw new Error("invalid city or zip");
        }

        const convertedData = {
            primaryExternalId: this.config.formId,
            groupCode: form.groupCode,
            planId: form.planId,
            planDetailsId: form.planDetailsId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            gender: form.gender,
            dob: form.dateOfBirth,
            primaryPhone: form.phone,
            heightFeet: form.heightFeet,
            heightInches: form.heightInches,
            weight: form.weight,
            address: form.address,
            address2: form.address2,
            city: city,
            stateId: form.stateId,
            zipCode: zip,
            timezoneId: form.timezoneId,
            disableNotifications: 0,
            numAllowedDependents: 0,
            sendRegistrationNotification: 0,
        };
        const formData = new FormData();
        for (const key in convertedData) {
            if (convertedData.hasOwnProperty(key)) {
                formData.append(key, convertedData[key]);
            }
        }

        try {
            const response = await sendLyricAuthenticatedRequest('/census/createMember/', formData)
            if(response?.data?.userid) {
                return {lyricPatientId: response.data.userid};
            }
        } catch (e) {
            return {
                error: {
                    code: e.response.status,
                    message: e.response.data
                }
            }
        }
    }
}

module.exports = {
    LyricRequestSender
}