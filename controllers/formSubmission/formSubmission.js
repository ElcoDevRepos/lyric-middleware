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
            return {
                error: {
                    code: 500,
                    message: "New Patient not implemented yet"
                }
            }

            let returnInfo = {};
            if(formInfo?.userDataStore?.lyric) {
                const consultationHandler = new LyricConsultationHandler({formInfo, form: verified_fields.form});
                const lyricData = await consultationHandler.createConsultation();
                returnInfo.lyricData = lyricData;
            }

            if(formInfo?.userDataStore?.webDoctors) {
                returnInfo.webDoctorsData = {message: 'Not implemented yet'};

                // const consultationHandler = new WebDoctorsConsultationHandler({formInfo, form: verified_fields.form});
                // const webDoctorsData = await consultationHandler.createConsultation();
                // if(!webDoctorsData.error) {
                //     returnInfo.webDoctorsData = webDoctorsData;
                // }
            }

            return returnInfo;
        } 

        if(formInfo.intent === 'New Patient') {
            
            let returnInfo = {};
            // if(formInfo?.userDataStore?.lyric) {
            //     const newPatientHandler = new NewLyricPatientHandler({formInfo, form: verified_fields.form});
            //     const lyricData = await newPatientHandler.createPatient();
            //     returnInfo.lyricData = lyricData;
            // }

            if(formInfo?.userDataStore?.webDoctors) {
                const newPatientHandler = new WebDoctorsNewPatientHandler({formInfo, form: verified_fields.form});
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