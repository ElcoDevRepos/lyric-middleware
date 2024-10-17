const { default: axios } = require("axios");
const { lyricLogin } = require("./auth");

async function sendLyricAuthenticatedRequest(endpoint, data) {
    console.log("STAGING: ", process.env.ENVIRONMENT == "staging")
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    const loginData = await lyricLogin();
    if(loginData.token) {
        const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: base + endpoint,
            headers: {
                Authorization: "Bearer " + loginData.token,
            },
            data: data,
        };
    
        return axios(config);
    }
}

module.exports = {
    sendLyricAuthenticatedRequest
}