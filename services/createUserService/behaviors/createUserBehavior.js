const { admin } = require("../../../firebase");
const { FirebaseService } = require("../../fireBaseService/firebaseService");

const { serverTimestamp } = "firebase/firestore";

class CreateUserBehavior {
    async create(data) {
        const {creator, newUser} = data;
        const user = await this.createUser(creator, newUser);
        return user;
    }

    async createUser(creator, newUser) {
        const newUserData = {
            creator: creator.id,
            fullName: newUser.fullName,
            email: newUser.email,
            groups: newUser.groups,
            roleName: newUser.role,
            createdAt: new Date()
        }

        const firebaseService = new FirebaseService();
        const authUser = await firebaseService.createEmailPassUser(newUser);

        if(authUser.error) {
            return authUser;
        }
        const uid = authUser.uid;

        let user = await firebaseService.createDocument('users', newUserData, uid);
        user.createdAt = new Date();

        const newRole = this.createNewRole(user.id, newUser.role);
        return {
            ...user, 
            role: newRole
        };
    }

    async createNewRole(id, role) {
        const newRoleData = {
            role: role
        }
        const firebaseService = new FirebaseService();
        const newRole = await firebaseService.createDocument('roles', newRoleData, id);

        return newRole;
    }
}

module.exports = {
    CreateUserBehavior
}