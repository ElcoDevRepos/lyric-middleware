const { LyricConsultationService } = require("../../../lyricConsultationService/lyricConsultationService")

class LyricRequestSender {
    constructor(config) {
        this.config = config
    }

    async create() {
        const lyricConsultationService = new LyricConsultationService(this.config);
        const data = await lyricConsultationService.create();

        return data;
    }
}

module.exports = {
    LyricRequestSender
}