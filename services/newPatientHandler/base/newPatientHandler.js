const { CreateMemberBehavior } = require("./behaviors/createMemberBehavior");

class NewPatientHandler {
    constructor(config) {
        this.config = config;
        this.parseFormBehavior = null; // takes md care form and converts it to web doctor or lyric form
        this.sendRequestBehavior = null; // sends the parsed form to the correct endpoint 
        this.postProcessBehavior = null;

        this.createMemberBehavior = CreateMemberBehavior;
    }

    async createPatient() {
        const parseFormBehavior = new this.parseFormBehavior(this.config);
        const parsedForm = await parseFormBehavior.parse();
        if(parsedForm.error) {
            return parsedForm;
        }

        const sendRequestBehavior = new this.sendRequestBehavior({...this.config, ...parsedForm});
        const response = await sendRequestBehavior.create();
        if(response.error) {
            return response;
        }
        
        const postProcessBehavior = new this.postProcessBehavior({...this.config, ...response});
        const postData = await postProcessBehavior.process();

        const createMemberBehavior = new this.createMemberBehavior({...this.config, ...response, ...postData, ...parsedForm});
        const member = await createMemberBehavior.create();
        return member;
    }
}

module.exports = {
    NewPatientHandler
}