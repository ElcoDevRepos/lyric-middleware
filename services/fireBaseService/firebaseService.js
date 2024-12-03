const { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc } = require("firebase/firestore");
const { firestore, admin } = require("../../firebase");

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

    async findDocumentById(collectionName, documentId) {
        try {
            const docRef = doc(firestore, collectionName, documentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data(), firebaseDoc: docSnap };
            } else {
                throw new Error("Document not found");
            }
        } catch (error) {
            throw new Error(`Failed to find the document by ID: ${error.message}`);
        }
    }

    async createDocument(collectionName, data, id = null) {
        console.log("data: ", data);
        try {
            const docRef = id 
                ? doc(firestore, collectionName, id) 
                : doc(collection(firestore, collectionName)); 
    
            await setDoc(docRef, data);
    
            return { id: docRef.id, ...data };
        } catch (error) {
            throw new Error(`Failed to create the document: ${error.message}`);
        }
    }

    async createEmailPassUser(newUser) {
        try {
            const userRecord = await admin.auth().createUser({
                email: newUser.email,
                password: newUser.password
            });
    
            const { uid } = userRecord;
            return {...newUser, uid};
        } catch (e) {
            console.log(e);
            console.log(e.message);

            let message = "Something went wrong creating user";
            if(e.message) {
                message = e.message;
            }
            return {
                error: {
                    code: 409,
                    message: message
                }
            }
        }
    }

    async updateDocumentById(collectionName, documentId, data) {
        try {
            const docRef = doc(firestore, collectionName, documentId);
            
            await updateDoc(docRef, data);
            
            return { id: documentId, ...data }; 
        } catch (error) {
            throw new Error(`Failed to update the document: ${error.message}`);
        }
    }
}

module.exports = {
    FirebaseService
}