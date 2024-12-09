const { doc, collection, getDoc, updateDoc, setDoc } = require("firebase/firestore");
const { MemberService } = require("../../../memberService/memberService");
const { firestore } = require("../../../../firebase");

class CreateMemberBehavior {
    constructor(config) {
        this.config = config;
    }

    async create() {
        const {lyricPatientId, webDoctorsPatientId, email, lyricExternalId} = this.config;

        const memberService = new MemberService();
        const member = await memberService.findMemberByEmail(email);

        let userDocRef;

        if(member) {
            userDocRef = member.firebaseDoc.ref;
            let updateData = {};
            if (lyricPatientId) {
                updateData.lyricPatientId = lyricPatientId;
            }
            if(lyricExternalId) {
                updateData.lyricExternalId = lyricExternalId;
            }
            if (webDoctorsPatientId) {
                updateData.webDoctorsPatientId = webDoctorsPatientId;
            }

            if (Object.keys(updateData).length > 0) {
                await updateDoc(userDocRef, updateData);
            } else {
            }
        } else {
            const newMember = {
                email,
                lyricPatientId: lyricPatientId || null,  
                webDoctorsPatientId: webDoctorsPatientId || null,
                lyricExternalId: lyricExternalId || null
            };

            userDocRef = doc(collection(firestore, 'members')); 
            await setDoc(userDocRef, newMember);
        }

        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
            const userData = { id: userSnapshot.id, ...userSnapshot.data() };
            return userData;  
        } else {
            return {
                error: {
                    code: 500, 
                    message: "Something went wrong creating member"
                }
            }
        }
    }
}

module.exports = {
    CreateMemberBehavior
}