const { getSSOToken } = require("../../lib/lyric/auth");
const { sendLyricAuthenticatedRequest } = require("../../lib/lyric/authRequest");

class LyricPharmacyFinderController {
    async get(req, res) {
        try {
            const {zipCode, query, memberExternalId, groupCode} = req.query;
            if(!zipCode && !query) {
                return res.status(400).send({message: "Please provide a zipCode or query in your query"});
            }

            if(!memberExternalId || !groupCode) {
                return res.status(400).send({message: "Please provide memberExternalId and groupCode in your query"});
            }

            const ssoToken = await getSSOToken(memberExternalId, groupCode);
            if(!ssoToken.token) {
                return res.status(401).send({message: "Cannot authorize with these credentials"});
            }

            let url = `/pharmacy/search?`
            if(query) {
                url+=`query=${query}`
                if(zipCode) {
                    url+="&"
                }
            } 

            if(zipCode) {
                url+=`zipCode=${zipCode}`
            }
            
            const response = await sendLyricAuthenticatedRequest(url, {}, 'get', ssoToken.token);
            const data = response.data;
            return res.status(200).send(data);
        } catch (e) {
            console.log(e);
            return res.status(500).send({message: "something went wrong, please try again later"})
        }
    }
}

module.exports = {
    LyricPharmacyFinderController
}