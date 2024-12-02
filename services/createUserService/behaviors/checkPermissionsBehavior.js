const { CreatePermissions } = require("../../../lib/permissions/createPermissions");
const { FirebaseService } = require("../../fireBaseService/firebaseService");

class CheckPermissionBehavior {
    async check(data) {
        const {creator, newUser} = data;
        const creatorRole = await this.findCreatorRole(creator);
        if(!creatorRole) {
            return {
                error: {
                    code: 403, 
                    message: "Creator does not have a role."
                }
            }
        }

        return this.compareRoles(creatorRole, newUser);
    }

    async findCreatorRole(creator) {
        try {
            const fireBaseService = new FirebaseService();
            console.log("creator id: ", creator.id);
            const userRole = await fireBaseService.findDocumentById('roles', creator.id);
            return userRole;
        } catch (e) {
            console.log(e);
            console.log("couldn't find")
            return null;
        }
    }

    async compareRoles(creatorRole, newUser) {
        const rolePermissions = CreatePermissions;
        const role = creatorRole?.role;
        if(!role) {
            return false;
        }

        if(!rolePermissions[role]?.[newUser?.role]) {
            return false;
        }

        return true;
    }
}

module.exports = {
    CheckPermissionBehavior
}