const { NewPatientHandler } = require("../base/newPatientHandler");
const { LyricPostProcessor } = require("./behaviors/lyricPostProcessor");
const { LyricRequestSender } = require("./behaviors/lyricRequestSender");
const { LyricFormParser } = require("./behaviors/parseFormBehavior");

class NewLyricPatientHandler extends NewPatientHandler {
    constructor(config) {
        super(config);

        this.parseFormBehavior = LyricFormParser; 
        this.sendRequestBehavior = LyricRequestSender; 
        this.postProcessBehavior = LyricPostProcessor; 
    }
}

module.exports = {
    NewLyricPatientHandler
}

