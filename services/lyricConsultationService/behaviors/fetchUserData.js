const { doc, getDocs, query, where, collection } = require("firebase/firestore");
const { firestore } = require("../../../firebase");

class LyricUserData {
    constructor(config) {
        this.config = config;
    }

    async fetch() {
        const userId = this.config.userId;
        const data = await this.getExternalId(userId);
        return data;
    }

    async getExternalId(userId) {
        if(!userId) {
            throw new Error("FetchUserData must be instantiated with a userId");
        }

        try {
            const formSubmissionsRef = collection(firestore, 'form-submissions');
            const q = query(formSubmissionsRef, where('lyricPatientId', '==', parseInt(userId)));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0]; 
                const documentId = doc.id; 
                return {memberExternalId: documentId};
            } else {
                return {
                    error: {
                        code: 404,
                        message: "No form-submissions in firebase with this userId"
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to find the form: ${error.message}`);
        }
    }
}

module.exports = {
    LyricUserData
}