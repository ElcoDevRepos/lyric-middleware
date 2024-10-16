const { ConsultationHandler } = require("../base/consultationHandler");
const { LyricPostProcessor } = require("./behaviors/lyricPostProcessor");
const { LyricRequestSender } = require("./behaviors/lyricRequestSender");
const { LyricFormParser } = require("./behaviors/parseFormBehavior");

class LyricConsultationHandler extends ConsultationHandler {
    constructor(config) {
        super(config);

        this.parseFormBehavior = LyricFormParser; 
        this.sendRequestBehavior = LyricRequestSender; 
        this.postProcessBehavior = LyricPostProcessor; 
    }
}

module.exports = {
    LyricConsultationHandler
}

