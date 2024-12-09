class LyricConsultationPayload {
    constructor(config) {
        this.config = config;
    }

    async create() {
        const user = this.config.eligibilityData.user;
        const userId = this.config.userId;

        const patientRecords = this.config.patientRecords;
        const personal = {
            heightFeet: patientRecords.patient.ehr.personal[0].heightFeet,
            heightInches: patientRecords.patient.ehr.personal[0].heightInches,
            weight: patientRecords.patient.ehr.personal[0].weight,
            breastfeeding: patientRecords.patient.ehr.personal[0].breastfeeding,
            pregnant: patientRecords.patient.ehr.personal[0].pregnant,
            last_menstruation_date:
            patientRecords.patient.ehr.personal[0].last_menstruation_date,
        };
        const attachments = patientRecords.patient.ehr.attachments || [];
        delete patientRecords.patient.ehr.attachments;
        delete patientRecords.patient.ehr.personal;
        delete patientRecords.patient.ehr.doseSpotConfirmed;
        delete patientRecords.patient.ehr.nonTransferrableAllergies;
        delete patientRecords.patient.ehr.nonTransferrableMedications;
        patientRecords.patient.ehr = Object.fromEntries(
            Object.entries(patientRecords.patient.ehr).map(([key, value]) => [
                key.replace(/([A-Z])/g, "_$1").toLowerCase(),
                value,
            ])
        );

        let appointment_details;
        if (this.config.consultationType == "urgentcare") {
            appointment_details = {
                when_scheduled: this.config.whenScheduled,
                consult_time_zone: this.config.timezoneOffset,
                preferred_language: this.config.translate,
            };
        } else {
            appointment_details = {
                provider_id: this.config.provider_id,
                time_slot_id: this.config.time_slot_id,
                consult_time_zone: "America/Chicago",
            };
        }

        let patientPayload = {
            patient: {
                user_id: parseInt(userId),
                ehr: {
                    ...patientRecords.patient.ehr,
                    attachments: attachments,
                    personal: personal,
                },
            },
            payment: {
                fee: 0.0,
                nonce: "",
            },
            modality: this.config.modality,
            sureScriptPharmacy_id: this.config.pharmacyId,
            appointment_details: appointment_details,
            state: this.config.state,
            reason_for_visit: this.config.reason_for_visit,
            problems: {
                chief_complaint_id: this.config.chiefComplaint,
                other_problems: this.config.otherProblems
            },
            prescription_refill: {
                is_needed: false,
                prescription_details: "",
            },
            patientPhone: this.config.phoneNumber,
            labs: []
        };

        if (this.config.consultationType != "urgentcare") {
            patientPayload.questionnaires = this.config.questionnaires || [];
        }
        return patientPayload;
    }
}

module.exports = {
    LyricConsultationPayload
}