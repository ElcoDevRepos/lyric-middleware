const { EditGroupsPermissions } = require("../../lib/permissions/editGroups");
const { CheckPermissionBehavior } = require("../../services/createUserService/behaviors/checkPermissionsBehavior");
const { FirebaseService } = require("../../services/fireBaseService/firebaseService");
const { BasePostController } = require("../base/base");

class UpdateUserGroupsController extends BasePostController {
    constructor() {
        super();
        this.required_fields = [
            'userId',
            'groups',
        ];
    }

    async post(verified_fields) { 
        const creatorId = this.req.user.uid;
        const creator = {
            id: creatorId
        };
        const firebaseService = new FirebaseService();

        const editedUserRole = await firebaseService.findDocumentById('roles', verified_fields.userId);

        const newUser = {
            id: verified_fields.userId,
            role: editedUserRole.role
        };

        const checkPermissionBehavior = new CheckPermissionBehavior();
        const permissions = await checkPermissionBehavior.check({
            creator, 
            newUser,
            rolePermissions: EditGroupsPermissions
        });

        if(permissions.error) {
            return permissions;
        }

        const updatedUser = await firebaseService.updateDocumentById('users', newUser.id, {groups: verified_fields.groups});

        return updatedUser;
    } 
}

module.exports = {
    UpdateUserGroupsController
}