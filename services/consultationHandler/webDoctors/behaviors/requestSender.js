const { getCityName } = require("../../../../lib/google/getCity");
const { sendWebDoctorsAuthRequest } = require("../../../../lib/webDoctors/authRequest")

class WebDoctorConsultationRequest {
    constructor(form) {
        this.form = form
    }

    async create() {
        const form = this.form;

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

        const wdVendorId = process.env.ENVIRONMENT == "staging" ? 35 : 18;

        const member = {
            PatientId: form.patientId,
            ReasonId: '', 
            SymptomIds: [''],
            CreatedBy: wdVendorId
        };
        member.FirstName = form.firstName.replace(/[-\s]/g, "");
        member.LastName = form.lastName.replace(/[-\s]/g, "");

        try {
            const response = await sendWebDoctorsAuthRequest("/api/patient/createpatient", JSON.stringify(member));
            if(response?.data) {
                return {id: response.data};
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
    WebDoctorConsultationRequest
}