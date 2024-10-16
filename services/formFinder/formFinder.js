const { FirebaseFormFinder } = require("./behaviors/firebaseFormFinder");

class FormFinder {
    constructor(config) {
        this.config = config;

        this.findBehavior = FirebaseFormFinder;
    }

    async getFormInfo() {
        const findBehavior = new this.findBehavior(this.config);
        const formInfo = await findBehavior.find();

        return formInfo;
    }
}

module.exports = {
    FormFinder
}