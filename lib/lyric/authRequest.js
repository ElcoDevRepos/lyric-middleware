const { default: axios } = require("axios");
const { lyricLogin } = require("./auth");

async function sendLyricAuthenticatedRequest(endpoint, data) {
    console.log("STAGING: ", process.env.ENVIRONMENT == "staging")
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    let creds = {
        email:
            process.env.ENVIRONMENT == "staging"
            ? "MTMMDVC01SSO@mytelemedicine.com"
            : "MTMAIM01SSO@mytelemedicine.com",
        password:
            process.env.ENVIRONMENT == "staging"
            ? ")7(M9V@dW13@1n8AZa6K"
            : "CdGt{[1qIQ,+[xZZ@K3Q",
    };

    const loginData = await lyricLogin(creds.email, creds.password);
    if(loginData.token) {
        console.log(loginData.token);
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