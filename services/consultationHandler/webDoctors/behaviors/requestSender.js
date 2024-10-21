const { sendWebDoctorsAuthRequest } = require("../../../../lib/webDoctors/authRequest")

class WebDoctorConsultationRequest {
    constructor(form) {
        this.form = form
    }

    async create() {
        const form = this.form;

        const data = {
            PatientId: form?.patientId,
            ReasonId: form?.reasonId, 
            SymptomIds: form?.symptomIds?.join(','),
            CreatedBy: form?.createdBy?form.createdBy:form.patientId
        };

        try {
            const response = await sendWebDoctorsAuthRequest("/api/encounter/create", JSON.stringify(data));
            if(response?.data) {
                return {webDoctorsConsultationId: response.data};
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