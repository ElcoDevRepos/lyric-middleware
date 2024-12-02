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

        const canCreate = this.compareRoles(creatorRole, newUser);

        if(!canCreate) {
            return {
                error: {
                    code: 403, 
                    message: `${creatorRole?.role}s cannot create ${newUser?.role}s`
                }
            }
        } 

        return {creatorRole};
    }

    async findCreatorRole(creator) {
        try {
            const fireBaseService = new FirebaseService();
            const userRole = await fireBaseService.findDocumentById('roles', creator.id);
            return userRole;
        } catch (e) {
            return null;
        }
    }

    compareRoles(creatorRole, newUser) {
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