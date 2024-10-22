const { getSSOToken } = require("../../lib/lyric/auth");
const { CheckEligibilityBehavior } = require("../../services/lyricConsultationService/behaviors/checkEligibilityBehavior");
const { LyricUserData } = require("../../services/lyricConsultationService/behaviors/fetchUserData");
const { BasePostController } = require("../base/base");

class LyricEligibilityController extends BasePostController {
    constructor() {
        super();

        this.required_fields = [
            'groupCode',
            'memberId',
            'type',
            'modality',
        ]
    }

    async post(verified_fields) {
        const { groupCode, memberId, type, modality } = verified_fields;
    
        const lyricUserDataService = new LyricUserData({userId: memberId});
        const lyricUserData = await lyricUserDataService.getExternalId(memberId);
        if(lyricUserData.error) {
            return lyricUserData;
        }

        const memberExternalId = lyricUserData.memberExternalId;
        const ssoToken = await getSSOToken(memberExternalId, groupCode);

        const token = ssoToken.token;
        const checkEligibilityBehavior = new CheckEligibilityBehavior({
            consultationType: type, 
            modality: modality, 
            ssoToken: token
        });

        const eligibleUser = await checkEligibilityBehavior.check();
        return {...eligibleUser, memberExternalId};
    }
}

module.exports = {
    LyricEligibilityController
}