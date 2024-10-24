const { getSSOToken } = require("../../lib/lyric/auth");
const { sendLyricAuthenticatedRequest } = require("../../lib/lyric/authRequest");
const { BasePostController } = require("../base/base");

class StartConsultationInformationController extends BasePostController {
    constructor() {
        super();

        this.required_fields = [
            'groupCode',
            'patientId',
            'type',
            'modality',
            'externalId'
        ]
    }

    async post(verified_fields) {
        const {groupCode, type, modality, patientId, externalId} = verified_fields;
        const ssoToken = await getSSOToken(externalId, groupCode);
        const token = ssoToken.token;
        const url = `/v2/consultation/${type}?user_id=${parseInt(patientId)}&modality=${modality}`
        try {
            const res = await sendLyricAuthenticatedRequest(url, {}, 'get', token);
            const consultData = res.data;
            return consultData;
        } catch (e) {
            return {
                error: {
                    code: e.response.status,
                    message: e.response.data
                }
            }
        }
    }
}

module.exports = {
    StartConsultationInformationController
}