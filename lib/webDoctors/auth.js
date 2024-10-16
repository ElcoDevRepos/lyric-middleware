const { default: axios } = require("axios");
const qs = require("qs");

async function webDoctorsLogin() {
    const baseWD =
      process.env.ENVIRONMENT == "staging"
        ? "https://stgwbclientapi.azurewebsites.net"
        : "https://wbclientapi.webdoctors.com";

    let data = qs.stringify({
      username:
        process.env.ENVIRONMENT == "staging"
          ? "rahulupreti01@mailinator.com"
          : "steve@mdvirtualcare.com",
      password:
        process.env.ENVIRONMENT == "staging"
          ? "Password@12345"
          : "100Gateway864!",
      grant_type: "password",
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: baseWD + "/Token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
}

module.exports = {
    webDoctorsLogin
}