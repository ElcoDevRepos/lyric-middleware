const { doc, updateDoc } = require("firebase/firestore");
const { firestore } = require("../../../../firebase");

class WebDoctorsPostProcessor {
    constructor(config) {
        this.config = config;
    }

    async process() {
        const formSubmissionId = this.config.formSubmissionId;
    
        const formSubmissionRef = doc(firestore, 'form-submissions', formSubmissionId);
    
        try {
            await updateDoc(formSubmissionRef, {
                webDoctorsConsultationId: this.config.webDoctorsConsultationId 
            });
    
            return {
                webDoctorsConsultationId: this.config.webDoctorsConsultationId 
            }
        } catch (error) {
            return {
                error: {
                    code: 500,
                    message: "could not update form submission with web doctors consultation id"
                }
            }
        }
    }
}

module.exports = {
    WebDoctorsPostProcessor
}