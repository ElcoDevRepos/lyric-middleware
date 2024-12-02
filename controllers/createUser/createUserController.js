const { CreateUserService } = require("../../services/createUserService/createUserService");
const { BasePostController } = require("../base/base");

class CreateUserController extends BasePostController {
    constructor() {
        super();
        this.required_fields = [
            'email',
            'role',
            'fullName',
            'groups',
            'password'
        ];
    }

    async post(verified_fields) { 
        const creatorId = this.req.user.uid;
        const createUserService = new CreateUserService({id: creatorId});
        const newUserData = await createUserService.createUser(verified_fields);
        return newUserData;
    } 
}

module.exports = {
    CreateUserController
}