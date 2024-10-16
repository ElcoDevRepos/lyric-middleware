class ConsultationHandler {
    constructor(config) {
        this.config = config;

        this.parseFormBehavior = null; // takes md care form and converts it to web doctor or lyric form
        this.sendRequestBehavior = null; // sends the parsed form to the correct endpoint 
        this.postProcessBehavior = null; // saves response in md care database 
    }

    async createConsultation() {
        const parseFormBehavior = new this.parseFormBehavior(config);
        const parsedForm = await parseFormBehavior.parse();
        if(parsedForm.error) {
            return parsedForm;
        }

        const sendRequestBehavior = new this.sendRequestBehavior(parsedForm);
        const response = await sendRequestBehavior.sendRequest();
        if(response.error) {
            return response;
        }
        
        const postProcessBehavior = new this.postProcessBehavior(response);
        const postData = await postProcessBehavior.process();

        return postData;
    }
}

module.exports = {
    ConsultationHandler
}