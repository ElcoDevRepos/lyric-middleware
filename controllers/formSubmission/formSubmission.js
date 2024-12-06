const { LyricConsultationHandler } = require("../../services/consultationHandler/lyric/lyric");
const { WebDoctorsConsultationHandler } = require("../../services/consultationHandler/webDoctors/webDoctors");
const { FormFinder } = require("../../services/formFinder/formFinder");
const { MemberService } = require("../../services/memberService/memberService");
const { CreateMemberBehavior } = require("../../services/newPatientHandler/base/behaviors/createMemberBehavior");
const { NewLyricPatientHandler } = require("../../services/newPatientHandler/lyric/lyric");
const { WebDoctorsNewPatientHandler } = require("../../services/newPatientHandler/webDoctors/webDoctors");
const { BasePostController } = require("../base/base");

class FormSubmissionController extends BasePostController {
    constructor(submitConfig) {
        super();
        this.required_fields = [
            'formId',
            'form',
            'formSubmissionId'
        ]
        this.submitConfig = submitConfig;
    }

    async post(verified_fields) {
        const submitConfig = this.submitConfig;
        const formFinder = new FormFinder({formId: verified_fields.formId}); 
        const formInfo = await formFinder.getFormInfo();
        console.log("validating: ", submitConfig.validate)
        if(formInfo.error) {
            return formInfo
        }

        if(formInfo.intent === 'Consultation') {

            let returnInfo = {};
            if(formInfo?.userDataStore?.lyric) {
                const consultationHandler = new LyricConsultationHandler({...verified_fields, formInfo, form: verified_fields.form});
                if(submitConfig?.validate) {
                    return {
                        isValid: true
                    }
                    return {
                        error: {
                            code: 400,
                            message: "invalid form"
                        }
                    }
                } else {
                    const lyricData = await consultationHandler.createConsultation();
                    returnInfo.lyricData = lyricData;
                }
            }

            if(formInfo?.userDataStore?.webDoctors) {
                const consultationHandler = new WebDoctorsConsultationHandler({...verified_fields, formInfo, form: verified_fields.form});
                if(submitConfig?.validate) {
                    return {
                        isValid: true
                    }
                    return {
                        error: {
                            code: 400,
                            message: "invalid form"
                        }
                    }
                } else {
                    const webDoctorsData = await consultationHandler.createConsultation();
                    returnInfo.webDoctorsData = webDoctorsData;
                }
            }

            return returnInfo;
        } 

        if(formInfo.intent === 'New Patient') {
            let foundMember;

            const formFinder = new FormFinder({formId: verified_fields.formId}); 
            const formInfo = await formFinder.getFormInfo();

            const memberService = new MemberService();
            const email = verified_fields?.form?.email;
            if(email) {
                foundMember = await memberService.findMemberByEmail(email);
            }

            let returnInfo = {};
            if(!foundMember && !formInfo?.userDataStore?.lyric && !formInfo?.userDataStore?.webDoctors) {
                const createMemberBehavior = new CreateMemberBehavior({email});
                if(submitConfig?.validate) {
                    return {
                        isValid: true
                    }
                    return {
                        error: {
                            code: 400,
                            message: "invalid form"
                        }
                    }
                } else {
                    const newMember = await createMemberBehavior.create();
                    returnInfo.newMember = newMember;
                }
            }

            if(formInfo?.userDataStore?.lyric && !foundMember?.lyricPatientId) {
                const newPatientHandler = new NewLyricPatientHandler({...verified_fields, formInfo, form: verified_fields.form});
                if(submitConfig?.validate) {
                    return {
                        isValid: true
                    }
                    return {
                        error: {
                            code: 400,
                            message: "invalid form"
                        }
                    }
                } else {
                    const lyricData = await newPatientHandler.createPatient();
                    returnInfo.lyricData = lyricData;
                }
            }

            if(formInfo?.userDataStore?.webDoctors && !foundMember?.webDoctorsPatientId) {
                const newPatientHandler = new WebDoctorsNewPatientHandler({...verified_fields, formInfo, form: verified_fields.form});
                if(submitConfig?.validate) {
                    return {
                        isValid: true
                    }
                    return {
                        error: {
                            code: 400,
                            message: "invalid form"
                        }
                    }
                } else {
                    const webDoctorsData = await newPatientHandler.createPatient();
                    returnInfo.webDoctorsData = webDoctorsData;
                }
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