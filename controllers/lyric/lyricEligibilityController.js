const { getSSOToken } = require("../../lib/lyric/auth");
const { CheckEligibilityBehavior } = require("../../services/lyricConsultationService/behaviors/checkEligibilityBehavior");
const { LyricUserData } = require("../../services/lyricConsultationService/behaviors/fetchUserData");
const { MemberService } = require("../../services/memberService/memberService");
const { BasePostController } = require("../base/base");

class LyricEligibilityController extends BasePostController {
    constructor() {
        super();

        this.required_fields = [
            'groupCode',
            'email',
            'type',
            'modality',
        ]
    }

    async post(verified_fields) {
        const {groupCode, email, type, modality} = verified_fields;
        const memberService = new MemberService();
        console.log(email);
        const member = await memberService.findMemberByEmail(email);
        if(!member || !member.lyricExternalId) {
            return {
                error: {
                    code: 400,
                    message: "This user does not exist or cannot create a consultation of this type"
                }
            }
        }
        console.log("member.lyricExternalId: ", member.lyricExternalId);

        const ssoToken = await getSSOToken(member.lyricExternalId, groupCode);
        const token = ssoToken.token;

        const consultationConfig = {
            consultationType: type,
            modality: modality,
            ssoToken: token
        }

        const eligibilityChecker = new CheckEligibilityBehavior(consultationConfig);
        const check = await eligibilityChecker.check();
        let consult = {eligible: check?.user?true:false}
        if(check?.error?.code === 400) {
            consult.details = 'Member not configured for this consultation type.'
        }

        return {
            consult, 
            user: {
                id: member.id, 
                email: member.email, 
                patientId: member.lyricPatientId, 
                externalId: member.lyricExternalId

            }
        };
    }
}

module.exports = {
    LyricEligibilityController
}