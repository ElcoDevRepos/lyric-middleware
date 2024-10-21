const { default: axios } = require("axios");

async function lyricLogin() {
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    const email = process.env.ENVIRONMENT == "staging"
        ? "MTMMDVC01@mytelemedicine.com"
        : "MTMAIM01@mytelemedicine.com"

    const password = process.env.ENVIRONMENT == "staging"
        ? "|faeiXj-4d9UD1aLf9w9"
        : "!vse5d4BzL1s0u#irN@!"

    var data = new FormData();
    data.append("email", email);
    data.append("password", password);
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/login",
      data: data,
    };
    const response = await axios(config);
    if (response.data && response.data.success == true) {
        var token = response.headers.authorization;
        token = token.replace("Bearer ", "").trim();

        return {
            data: response.data,
            token
        }
    }

    return null;
}

async function lyricMemberLogin() {
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    const email = process.env.ENVIRONMENT == "staging"
        ? "MTMMDVC01SSO@mytelemedicine.com"
        : "MTMAIM01SSO@mytelemedicine.com"

    const password = process.env.ENVIRONMENT == "staging"
        ? ")7(M9V@dW13@1n8AZa6K"
        : "CdGt{[1qIQ,+[xZZ@K3Q"
    
    var data = new FormData();
    data.append("email", email);
    data.append("password", password);
    var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: base + "/login",
        data: data,
    };
    const response = await axios(config);
    if (response.data && response.data.success == true) {
        var token = response.headers.authorization;
        token = token.replace("Bearer ", "").trim();

        return {
            data: response.data,
            token
        }
    }

    return null;
}

async function getSSOToken(patientExternalId, groupCode) {
    const base =
    process.env.ENVIRONMENT == "staging"
        ? "https://staging.getlyric.com/go/api"
        : "https://portal.getlyric.com/go/api";

    const memberExternalId = patientExternalId;
    const loginData = await lyricMemberLogin();

    const token = loginData?.token;

    var data = new FormData();
    data.append("memberExternalId", memberExternalId);
    data.append("groupCode", groupCode);

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: base + "/sso/createAPIAccessToken",
        headers: {
            Authorization: "Bearer " + token,
        },
        data: data,
    };

    const response = await axios(config);
    if (response.data && response.data.success == true) {
        const token = response.data?.accessToken;
        return {
            token
        }
    }

    return null;
}

module.exports = {
    lyricLogin,
    getSSOToken
}