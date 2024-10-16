const { sendWebDoctorsAuthRequest } = require("../../../../lib/webDoctors/authRequest")

class WebDoctorsRequestSender {
    constructor(config) {
        this.config = config
    }

    async sendRequest() {
        const data = await sendWebDoctorsAuthRequest();
        console.log(data);
    }
}

module.exports = {
    WebDoctorsRequestSender
}