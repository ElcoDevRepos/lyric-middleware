class LyricPostProcessor {
    constructor(config) {
        this.config = config;
    }

    async process() {
        return {
            success: this.config.success
        }
    }
}

module.exports = {
    LyricPostProcessor
}