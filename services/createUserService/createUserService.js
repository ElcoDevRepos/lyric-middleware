const { CheckPermissionBehavior } = require("./behaviors/checkPermissionsBehavior");
const { CreateUserBehavior } = require("./behaviors/createUserBehavior");

class CreateUserService {
    constructor(creator) {
        this.creator = creator;

        this.checkPermissionsBehavior = CheckPermissionBehavior;
        this.createUserBehavior = CreateUserBehavior;
    }

    async createUser(newUser) {
        const checkPermissionsBehavior = new this.checkPermissionsBehavior();
        const permissions = await checkPermissionsBehavior.check({creator: this.creator, newUser});
        if(permissions.error) {
            return permissions;
        }

        const createUserBehavior = new this.createUserBehavior();
        const createdUser = await createUserBehavior.create({creator: this.creator, newUser, permissions});
        return createdUser;
    }
}

module.exports = {
    CreateUserService
}