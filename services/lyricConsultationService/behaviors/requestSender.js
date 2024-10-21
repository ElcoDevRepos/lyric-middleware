const { sendLyricAuthenticatedRequest } = require("../../../lib/lyric/authRequest");

class LyricConsultationRequestSender {
    constructor(config) {
        this.config = config;
    }

    async send() {
        const payload = this.config.payload;
        const url = `/consultation/createConsultation/${this.config.consultationType}`;

        try {
            const res = await sendLyricAuthenticatedRequest(url, payload, 'post', this.config.ssoToken);
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
    LyricConsultationRequestSender
}
