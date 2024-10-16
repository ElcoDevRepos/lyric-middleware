class FirebaseFormFinder {
    constructor(config) {
        this.config = config;
    }

    async find() {
        return {
            intent: 'Consultation',
            userDataStore: {
                lyric: true,
                webDoctors: true
            }
        }
    }
}

module.exports = {
    FirebaseFormFinder
}