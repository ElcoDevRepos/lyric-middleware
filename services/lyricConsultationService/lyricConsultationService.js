const { getSSOToken } = require("../../lib/lyric/auth");
const { CheckEligibilityBehavior } = require("./behaviors/checkEligibilityBehavior");
const { FetchUserData } = require("./behaviors/fetchUserData");
const { LyricConsultationPayload } = require("./behaviors/lyricConsultationPayload");
const { LyricPatientRecordCollector } = require("./behaviors/patientRecordCollector");
const { LyricConsultationRequestSender } = require("./behaviors/requestSender");

class LyricConsultationService {
    constructor(config) {
        this.config = config;

        this.fetchUserDataBehavior = FetchUserData;
        this.checkEligibilityBehavior = CheckEligibilityBehavior;
        this.patientRecordCollector = LyricPatientRecordCollector; 
        this.createPayloadBehavior = LyricConsultationPayload;
        this.requestSender = LyricConsultationRequestSender;
    }

    async create() {
        const groupCode = this.config.formInfo?.lyricMetaData?.groupCode;

        const fetchUserDataBehavior = new this.fetchUserDataBehavior(this.config);
        const userData = await fetchUserDataBehavior.fetch();
        if(userData.error) {
            return userData;
        }
        const memberExternalId = userData.memberExternalId;
        const ssoToken = await getSSOToken(memberExternalId, groupCode);
        if(!ssoToken.token) {
            return {
                error: {
                    code: 400,
                    message: "Could not get an SSO token for this external patient ID and group code combination"
                }
            }
        }
        this.config.ssoToken = ssoToken.token;

        const checkEligibilityBehavior = new this.checkEligibilityBehavior(this.config);
        const eligibilityData = await checkEligibilityBehavior.check();
        if(eligibilityData.error) {
            return eligibilityData;
        }

        this.config.eligibilityData = eligibilityData;
        const patientRecordCollector = new this.patientRecordCollector(this.config);
        const patientRecords = await patientRecordCollector.collect();
        if(patientRecords.error) {
            return patientRecords;
        }

        this.config.patientRecords = patientRecords;

        const createPayloadBehavior = new this.createPayloadBehavior(this.config);
        const payload = await createPayloadBehavior.create();
        this.config.payload = payload;

        const requestSender = new this.requestSender(this.config);
        const res = await requestSender.send();
        return res;
    }
}

module.exports = {
    LyricConsultationService
}