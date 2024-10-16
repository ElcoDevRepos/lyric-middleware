const { lyricLogin } = require("../../../../lib/lyric/auth");

class LyricFormParser {
    constructor(config) {
        this.config = config;
    }

    async parse() {
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
        console.log(loginData);

        console.log("parsing form");
        return {
            error: {
                code: 500,
                message: "not implemented"
            }
        }
    }
}

module.exports = {
    LyricFormParser
}