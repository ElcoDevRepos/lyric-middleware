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
                webDoctorsPatientId: this.config.webDoctorsPatientId  
            });
    
            return {
                webDoctorsPatientId: this.config.webDoctorsPatientId  
            }
        } catch (error) {
            return {
                error: {
                    code: 500,
                    message: "could not update form submission with web doctors patient id"
                }
            }
        }
    }
}

module.exports = {
    WebDoctorsPostProcessor
}