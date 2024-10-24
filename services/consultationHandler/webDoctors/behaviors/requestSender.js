const { collection, where, getDocs, query } = require("firebase/firestore");
const { firestore } = require("../../../../firebase");
const { sendWebDoctorsAuthRequest } = require("../../../../lib/webDoctors/authRequest")

class WebDoctorConsultationRequest {
    constructor(form) {
        this.form = form
    }

    async create() {
        const form = this.form;
        const memberData = await this.findWebdoctorsId();
        if(memberData?.error) {
            return memberData;
        }

        const patientId = memberData.patientId;

        const data = {
            PatientId: patientId,
            ReasonId: form?.reasonId, 
            SymptomIds: form?.symptomIds?.join(','),
            CreatedBy: patientId
        };

        console.log("Data: ", data);
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

    async findWebdoctorsId() {
        const form = this.form;
        const email = form?.email;
        
        const membersRef = collection(firestore, 'members');
        const q = query(membersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]; 
            const memberData = doc.data(); 
            const patientId = memberData.webDoctorsPatientId;
            return {patientId};
        } else {
            return {
                error: {
                    code: 404,
                    message: "No member with this email and a patientId"
                }
            }
        }
    }
}

module.exports = {
    WebDoctorConsultationRequest
}