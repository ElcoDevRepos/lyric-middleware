const { FirebaseService } = require("../fireBaseService/firebaseService");

class MemberService {
    constructor(config) {
        this.config = config;
    }

    async findMemberByEmail(email) {
        const firebaseService = new FirebaseService();
        const filters = [{field: 'email', value: email}];
        const users = await firebaseService.findDocumentFilter('members', filters);
        if(users?.[0]) {
            return users[0];
        }
        return null;
    }
}

module.exports = {
    MemberService
}