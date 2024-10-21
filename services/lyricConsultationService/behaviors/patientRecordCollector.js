const { sendLyricAuthenticatedRequest } = require("../../../lib/lyric/authRequest");

class LyricPatientRecordCollector {
    constructor(config) {
        this.config = config;
    }

    async collect() {
        const consultationType = this.config.consultationType;
        const modality = this.config.modality;
        const user = this.config.eligibilityData.user;

        const url = "/v2/consultation/" + consultationType + "?user_id=" + user.user_id + "&modality=" + modality;
        try {
            const res = await sendLyricAuthenticatedRequest(url, {}, 'get', this.config.ssoToken);
            const data = res.data;
            return data;
        } catch (e) {
            return {
                error: {
                    code: e.response.status,
                    message: e.response.data
                }
            }
        }
    }
}

module.exports = {
    LyricPatientRecordCollector
}