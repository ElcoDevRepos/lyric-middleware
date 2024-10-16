const { LyricConsultationHandler } = require("../../services/consultationHandler/lyric/lyric");
const { WebDoctorsConsultationHandler } = require("../../services/consultationHandler/webDoctors/webDoctors");
const { FormFinder } = require("../../services/formFinder/formFinder");
const { BasePostController } = require("../base/base");

class FormSubmissionController extends BasePostController {
    constructor() {
        super();
        this.required_fields = [
            'formId',
            'form'
        ]
    }

    async post(verified_fields) {
        const formFinder = new FormFinder({formId: verified_fields.formId}); 
        const formInfo = await formFinder.getFormInfo();
        if(formInfo.error) {
            return formInfo
        }

        if(formInfo.intent === 'Consultation') {
            let returnInfo = {};
            if(formInfo?.userDataStore?.lyric) {
                const consultationHandler = new LyricConsultationHandler({formInfo, form: verified_fields.form});
                const lyricData = await consultationHandler.createConsultation();
                if(!lyricData.error) {
                    returnInfo.lyricData = lyricData;
                }
            }

            if(formInfo?.userDataStore?.webDoctors) {
                const consultationHandler = new WebDoctorsConsultationHandler({formInfo, form: verified_fields.form});
                const webDoctorsData = await consultationHandler.createConsultation();
                if(!webDoctorsData.error) {
                    returnInfo.webDoctorsData = {message: 'Not implemented yet'};
                }
            }

            return returnInfo;
        } 

        if(formInfo.intent === 'New Patient') {
            return {
                error: {
                    code: 500,
                    message: "New Patient not implemented yet"
                }
            }
        }

        return {
            error: {
                code: 400,
                message: 'Something went wrong, likely could not read form intent'
            }
        }
    }
}

module.exports = {
    FormSubmissionController
}