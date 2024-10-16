const { webDoctorsLogin } = require("./auth");

async function sendWebDoctorsAuthRequest() {
    const tokenData = await webDoctorsLogin();
    const token = tokenData.access_token;
    
}

module.exports = {
    sendWebDoctorsAuthRequest
}