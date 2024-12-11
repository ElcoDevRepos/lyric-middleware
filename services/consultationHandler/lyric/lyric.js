const { ConsultationHandler } = require("../base/consultationHandler");
const { LyricPostProcessor } = require("./behaviors/lyricPostProcessor");
const { LyricRequestSender } = require("./behaviors/lyricRequestSender");
const { LyricFormParser } = require("./behaviors/parseFormBehavior");
const { VerifyLyricConsultationForm } = require("./behaviors/verifyFormBehavior");

class LyricConsultationHandler extends ConsultationHandler {
    // note lyric has a lot more steps for creating a consultation, so the sendRequest behavior will use 
    // the lyricConsultationService. If you want the code for creating the actual consultation look in the 
    // LyricConsultationService class. This class is basically a middleware between the controller and that service.
    
    constructor(config) {
        super(config);

        this.verifyFormBehavior = VerifyLyricConsultationForm;
        this.parseFormBehavior = LyricFormParser; 
        this.sendRequestBehavior = LyricRequestSender; 
        this.postProcessBehavior = LyricPostProcessor; 
    }
}

module.exports = {
    LyricConsultationHandler
}

