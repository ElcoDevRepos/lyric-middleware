const { getCityName } = require("../../../../lib/google/getCity");
const { sendWebDoctorsAuthRequest } = require("../../../../lib/webDoctors/authRequest")

class WebDoctorPatientRequest {
    constructor(form) {
        this.form = form
    }

    async create() {
        const form = this.form;

        let city = form.city;
        let zip = "";
        if (form.zip) {
            zip = form.zip.split("-")[0];
        }
        if (!city && zip) {
            city = await getCityName(zip);
            city = city.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        } else if (!city && !zip) {
            throw new Error("invalid city or zip");
        }

        const wdVendorId = process.env.ENVIRONMENT == "staging" ? 35 : 18;

        const member = {
            ID: 0,
            FirstName: form.firstName,
            LastName: form.lastName,
            Email: form.email,
            VendorId: wdVendorId,
            Gender: form.gender,
            DateOfBirth: form.dateOfBirth,
            PhoneNo: form.phone,
            Address1: form.address,
            Address2: form.address2,
            City: city,
            Zipcode: zip,
            AccountType: 2 
        };
        member.FirstName = form.firstName.replace(/[-\s]/g, "");
        member.LastName = form.lastName.replace(/[-\s]/g, "");

        try {
            const response = await sendWebDoctorsAuthRequest("/api/patient/createpatient", JSON.stringify(member));
            if(response?.data) {
                return {webDoctorsPatientId: response.data};
            }
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
    WebDoctorPatientRequest
}