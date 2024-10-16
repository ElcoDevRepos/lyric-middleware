const { doc, getDoc } = require("firebase/firestore");
const { firestore } = require("../../../firebase");

class FirebaseFormFinder {
    constructor(config) {
        this.config = config;
    }

    async find() {
        const formId = this.config.formId;
        if(!formId) {
            throw new Error("FirebaseFormFinder must be instantiated with a formId");
        }

        try {
            const formRef = doc(firestore, 'forms', formId);
            
            const formSnap = await getDoc(formRef);

            if (formSnap.exists()) {
                return formSnap.data();
            } else {
                return {
                    error: {
                        code: 404,
                        message: "No form in firebase with this form id"
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to find the form: ${error.message}`);
        }
    }
}

module.exports = {
    FirebaseFormFinder
}