const { collection, query, where, getDocs } = require("firebase/firestore");
const { firestore } = require("../../firebase");

class FirebaseService {
    async findDocumentFilter(collectionName, filters) {
        try {
            const formSubmissionsRef = collection(firestore, collectionName);
            let q = formSubmissionsRef;
            filters.forEach(({ field, value, condition }) => {
                q = query(q, where(field, condition?condition:'==', value));
            });

            const querySnapshot = await getDocs(q);
        
            const results = [];
            querySnapshot.forEach((doc) => {
              results.push({ id: doc.id, ...doc.data(), firebaseDoc: doc });
            });
        
            return results;
        } catch (error) {
            throw new Error(`Failed to find the doc: ${error.message}`);
        }
    }
}

module.exports = {
    FirebaseService
}