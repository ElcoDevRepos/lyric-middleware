const { BaseHandlePaymentBehavior } = require("../../newPatientHandler/base/behaviors/handlePaymentBehavior");

class ConsultationHandler {
    constructor(config) {
        this.config = config;

        this.verifyFormBehavior = null;
        this.parseFormBehavior = null; // takes md care form and converts it to web doctor or lyric form
        this.sendRequestBehavior = null; // sends the parsed form to the correct endpoint 
        this.postProcessBehavior = null; 
        this.handlePaymentBehavior = BaseHandlePaymentBehavior;
    }

    async createConsultation() {
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

        const handlePaymentBehavior = new this.handlePaymentBehavior(this.config);
        await handlePaymentBehavior.handlePayment();
        return postData;
    }

    async verifyForm() {
        const verifyFormBehavior = new this.verifyFormBehavior(this.config);
        const verified = await verifyFormBehavior.verifyForm();
        return verified;
    }
}

module.exports = {
    ConsultationHandler
}