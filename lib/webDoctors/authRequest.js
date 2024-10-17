const { default: axios } = require("axios");
const { webDoctorsLogin } = require("./auth");

async function sendWebDoctorsAuthRequest(endpoint, data, method='post' ) {
    const tokenData = await webDoctorsLogin();
    const baseWD = "https://stgwbclientapi.azurewebsites.net"
    // process.env.ENVIRONMENT == "staging"
    //     ? "https://stgwbclientapi.azurewebsites.net"
    //     : "https://wbclientapi.webdoctors.com";

    const token = tokenData.access_token;
    let config = {
        method: method,
        maxBodyLength: Infinity,
        url: baseWD + endpoint,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        data: data,
    };

    return axios.request(config);
}

module.exports = {
    sendWebDoctorsAuthRequest
}