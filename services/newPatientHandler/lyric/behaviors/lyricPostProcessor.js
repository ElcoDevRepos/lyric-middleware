const { doc, updateDoc } = require("firebase/firestore");
const { firestore } = require("../../../../firebase");

class LyricPostProcessor {
    constructor(config) {
        this.config = config;
    }

    async process() {
        const formSubmissionId = this.config.formSubmissionId;
        const formSubmissionRef = doc(firestore, 'form-submissions', formSubmissionId);
    
        try {
            await updateDoc(formSubmissionRef, {
                lyricPatientId: this.config.lyricPatientId  
            });
    
            return {
                lyricPatientId: this.config.lyricPatientId  
            }
        } catch (error) {
            return {
                error: {
                    code: 500,
                    message: "could not update form submission with Lyric patient id"
                }
            }
        }
    }
}

module.exports = {
    LyricPostProcessor
}