const { getCityName, getAddressDetailsFromZip } = require("../../../../lib/google/getCity");
const { sendLyricAuthenticatedRequest } = require("../../../../lib/lyric/authRequest")

class LyricRequestSender {
    constructor(config) {
        this.config = config
    }

    async create() {
        const form = this.config;

        let zip = "";
        let addressComponents = null;

        if (form.zip) {
            zip = form.zip.split("-")[0];
            addressComponents = await getAddressDetailsFromZip(zip);
        }
        
        const feetHeight = parseInt(form.heightFeet);
        const inchHeight = parseInt(form.heightInches);
        const weight = parseInt(form.weight); 
        const stateAb = addressComponents?.[2]?.short_name;
        const city = addressComponents?.[1];

        const res = await sendLyricAuthenticatedRequest('/states/all', {}, 'get');
        const data = res?.data;
        const states = data?.states;
        const state = states?.find((s)=>s.abbreviation === stateAb);

        const stateId = parseInt(state.state_id);

        const convertedData = {
            primaryExternalId: this.config.formSubmissionId,
            groupCode: this.config.formInfo?.lyricMetaData?.groupCode,
            planId: this.config.formInfo?.lyricMetaData?.planId,
            planDetailsId: this.config.formInfo?.lyricMetaData?.planDetailsId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            gender: form.gender,
            dob: form.dateOfBirth,
            primaryPhone: form.phone,
            heightFeet: feetHeight,
            heightInches: inchHeight,
            weight: weight,
            address: form.address,
            address2: form.address2,
            city: city,
            stateId: stateId,
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