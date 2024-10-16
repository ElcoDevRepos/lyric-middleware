const { sendLyricAuthenticatedRequest } = require("../../../../lib/lyric/authRequest")

class LyricRequestSender {
    constructor(config) {
        this.config = config
    }

    async sendRequest() {
        const res = await sendLyricAuthenticatedRequest("/census/createMember", this.config);
        console.log(res.data);
    }
}

module.exports = {
    LyricRequestSender
}