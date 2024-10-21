const { default: axios } = require("axios");
const { lyricLogin } = require("./auth");

async function sendLyricAuthenticatedRequest(endpoint, data, method, token) {
    console.log("STAGING: ", process.env.ENVIRONMENT == "staging")
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    console.log("URL FOR AUTH: ", base);
    if(!token) {
        const loginData = await lyricLogin();
        token = loginData.token;
    }

    if(token) {
        const config = {
            method: method?method:"post",
            maxBodyLength: Infinity,
            url: base + endpoint,
            headers: {
                Authorization: "Bearer " + token,
            },
            data: data,
        };
    
        return axios(config);
    }
}

module.exports = {
    sendLyricAuthenticatedRequest
}