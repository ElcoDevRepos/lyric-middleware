const { sendLyricAuthenticatedRequest } = require("../../../../lib/lyric/authRequest")

class LyricRequestSender {
    constructor(config) {
        this.config = config
    }

    async create() {
        const data = {
            ...this.config.form,
            primaryExternalId: this.config.formId
        }
        const formData = new FormData();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                formData.append(key, data[key]);
            }
        }

        const response = await sendLyricAuthenticatedRequest('/census/createMember/', formData)
    }
}

module.exports = {
    LyricRequestSender
}