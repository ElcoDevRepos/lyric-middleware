const { sendLyricAuthenticatedRequest } = require("../../../lib/lyric/authRequest");

class CheckEligibilityBehavior {
    constructor(config) {
        this.config = config;
    }

    async check() {
        const consultationType = this.config.consultationType;
        const modality = this.config.modality;
        const url = "/v2/consultation/eligibility?consultation_type=" + consultationType + "&modality=" + modality;

        const res = await sendLyricAuthenticatedRequest(url, {}, 'get', this.config.ssoToken);
        const eligiblityData = res.data;

        if(!eligiblityData?.success) {
            return {
                error: {
                    code: 400,
                    message: `Something went wrong checking eligibility for ${this.config.consultationType}: ${eligiblityData.message}`,
                }
            }
        } 

        if(eligiblityData?.eligible_users?.length < 1) {
            return {
                error: {
                    code: 400,
                    message: `User not eligible for ${this.config.consultationType}`,
                }
            }
        } 

        const user = eligiblityData.eligible_users[0];

        return {user};
    }
}

module.exports = {
    CheckEligibilityBehavior
}