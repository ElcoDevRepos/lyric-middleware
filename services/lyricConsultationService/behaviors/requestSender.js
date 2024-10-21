const { sendLyricAuthenticatedRequest } = require("../../../lib/lyric/authRequest");

class LyricConsultationRequestSender {
    constructor(config) {
        this.config = config;
    }

    async send() {
        const payload = this.config.payload;
        const url = `/consultation/createConsultation/${this.config.consultationType}`;
        const res = await sendLyricAuthenticatedRequest(url, payload, 'post', this.config.ssoToken);
        const data = res.data;

        console.log("consultation data: ", data);
        return data;
    }
}

module.exports = {
    LyricConsultationRequestSender
}
