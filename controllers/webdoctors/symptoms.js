const { sendWebDoctorsAuthRequest } = require("../../lib/webDoctors/authRequest")

class WebDoctorsSymptomsController {
    async get(req, res) {
        try {
            const condition = req.query.condition;
            if(!condition) {
                return res.status(400).send({message: "include condition as a paramter in your endpoint ?condition=<id>"})
            }
            const response = await sendWebDoctorsAuthRequest(`/api/reason/symptoms?conditionId=${condition}`,{},"get");
            const symptoms = response.data;
            return res.status(200).send({symptoms})
        } catch(e) {
            console.log(e);
            return res.status(500).send({message: "Something went wrong, please try again later"})
        }
    }
}

module.exports = {
    WebDoctorsSymptomsController
}