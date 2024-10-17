const { sendWebDoctorsAuthRequest } = require("../../lib/webDoctors/authRequest")

class WebDoctorsConditionsController {
    async get(req, res) {
        try {
            const response = await sendWebDoctorsAuthRequest('/api/reason/conditions',{},"get");
            const conditions = response.data;
            return res.status(200).send({conditions})
        } catch(e) {
            console.log(e);
            return res.status(500).send({message: "Something went wrong, please try again later"})
        }
    }
}

module.exports = {
    WebDoctorsConditionsController
}