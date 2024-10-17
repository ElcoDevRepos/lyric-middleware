const { LyricConsultationHandler } = require("../../services/consultationHandler/lyric/lyric");
const { WebDoctorsConsultationHandler } = require("../../services/consultationHandler/webDoctors/webDoctors");
const { FormFinder } = require("../../services/formFinder/formFinder");
const { NewLyricPatientHandler } = require("../../services/newPatientHandler/lyric/lyric");
const { WebDoctorsNewPatientHandler } = require("../../services/newPatientHandler/webDoctors/webDoctors");
const { BasePostController } = require("../base/base");

class FormSubmissionController extends BasePostController {
    constructor() {
        super();
        this.required_fields = [
            'formId',
            'form',
            'formSubmissionId'
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
            // if(formInfo?.userDataStore?.lyric) {
            //     const consultationHandler = new LyricConsultationHandler({...verified_fields, formInfo, form: verified_fields.form});
            //     const lyricData = await consultationHandler.createConsultation();
            //     returnInfo.lyricData = lyricData;
            // }

            if(formInfo?.userDataStore?.webDoctors) {
                const consultationHandler = new WebDoctorsConsultationHandler({...verified_fields, formInfo, form: verified_fields.form});
                const webDoctorsData = await consultationHandler.createConsultation();
                returnInfo.webDoctorsData = webDoctorsData;
            }

            return returnInfo;
        } 

        if(formInfo.intent === 'New Patient') {
            
            let returnInfo = {};
            // if(formInfo?.userDataStore?.lyric) {
            //     const newPatientHandler = new NewLyricPatientHandler({...verified_fields, formInfo, form: verified_fields.form});
            //     const lyricData = await newPatientHandler.createPatient();
            //     returnInfo.lyricData = lyricData;
            // }

            if(formInfo?.userDataStore?.webDoctors) {
                const newPatientHandler = new WebDoctorsNewPatientHandler({...verified_fields, formInfo, form: verified_fields.form});
                const webDoctorsData = await newPatientHandler.createPatient();
                returnInfo.webDoctorsData = webDoctorsData;
            }

            return returnInfo;
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