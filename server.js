const express = require("express");
const axios = require("axios");
const qs = require("qs");
const auth = require("basic-auth");
const fs = require("fs");

var bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const multer = require("multer");
let Blob;
var storage = multer.memoryStorage(); // Storing files in memory
var upload = multer({ storage: storage });
require("dotenv").config();

import("fetch-blob").then((module) => {
  Blob = module.Blob;
});
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "mdvirtualcare api",
      version: "1.0.0",
    },
  },
  // Path to the API docs
  apis: ["./server.js"], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();
const PORT = process.env.PORT || 8000;

const base =
  process.env.ENVIRONMENT == "staging"
    ? "https://staging.getlyric.com/go/api"
    : "https://portal.getlyric.com/go/api";
const baseWD =
  process.env.ENVIRONMENT == "staging"
    ? "https://stgwbclientapi.azurewebsites.net"
    : "https://wbclientapi.webdoctors.com";

const wdVendorId = process.env.ENVIRONMENT == "staging" ? 35 : 15; // staging is 35

// Middleware to handle JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});
const authMiddleware = (req, res, next) => {
  const user = auth(req);

  const USERNAME = process.env.SWAGGER_USERNAME;
  const PASSWORD = process.env.SWAGGER_PASSWORD;

  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send("Authentication required.");
  }

  return next();
};

async function login(email, password) {
  var data = new FormData();
  data.append("email", email);
  data.append("password", password);
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: base + "/login",
    data: data,
  };
  return axios(config);
}
async function getSSOAPIToken(memberExternalId, groupCode) {
  try {
    let creds = {
      email:
        process.env.ENVIRONMENT == "staging"
          ? "MTMMDVC01SSO@mytelemedicine.com"
          : "MTMAIM01SSO@mytelemedicine.com",
      password:
        process.env.ENVIRONMENT == "staging"
          ? ")7(M9V@dW13@1n8AZa6K"
          : "CdGt{[1qIQ,+[xZZ@K3Q",
    };
    var response = await login(creds.email, creds.password);

    if (response.data && response.data.success == true) {
      var token = response.headers.authorization;
      token = token.replace("Bearer ", "").trim();
      const queryData = qs.stringify({
        memberExternalId: memberExternalId,
        groupCode: groupCode,
      });
      config = {
        method: "post",
        maxBodyLength: Infinity,
        url: base + "/sso/createAPIAccessToken",
        data: queryData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      response = await axios(config);
      if (response.data.success) {
        return response.data.accessToken;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.log(error.response);
    return null;
  }
}

async function getCensusAdminToken() {
  var response = await login(
    process.env.ENVIRONMENT != "staging"
      ? "MTMAIM01@mytelemedicine.com"
      : "MTMMDVC01@mytelemedicine.com",
    process.env.ENVIRONMENT != "staging"
      ? "!vse5d4BzL1s0u#irN@!"
      : "|faeiXj-4d9UD1aLf9w9"
  );
  if (response.data && response.data.success == true) {
    var token = response.headers.authorization;
    token = token.replace("Bearer ", "").trim();
    return token;
  }
  return null;
}

async function getWebDoctorsToken(username, password) {
  try {
    let data = qs.stringify({
      username:
        process.env.ENVIRONMENT == "staging"
          ? "rahulupreti01@mailinator.com"
          : "steve@mdvirtualcare.com",
      password:
        process.env.ENVIRONMENT == "staging"
          ? "Password@12345"
          : "100Gateway864!",
      grant_type: "password",
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: baseWD + "/Token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function createMemberHelper(req, accessToken, isWebDoctors = false) {
  try {
    if (!req) throw new Error("Request is required");
    if (!accessToken) {
      // accessToken = await getCensusAdminToken();
    }
    let member = {};
    var data = new FormData();

    if (isWebDoctors) {
      let city = req.body.city;
      let zip = "";
      if (req.body.zip) {
        zip = req.body.zip.split("-")[0];
      }
      if (!city && zip) {
        city = await getCityName(zip);
        city = city.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      } else {
        throw new Error("invalid city or zip");
        }
      console.log("CITY HERE!");
      console.log(city);

      member = {
        ID: 0,
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        VendorId: wdVendorId,
        Gender: req.body.gender,
        DateOfBirth: req.body.dateOfBirth,
        PhoneNo: req.body.phone,
        Address1: req.body.address,
        Address2: req.body.address2,
        City: city,
        Zipcode: zip,
      };
      member.FirstName = req.body.firstName.replace(/[-\s]/g, "");
      member.LastName = req.body.lastName.replace(/[-\s]/g, "");
      console.log("MEMBER!");
      console.log(member);
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: baseWD + "/api/ZapierIntegration/CreateMember",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(member),
      };

      return axios.request(config);
    } else {
      member = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: req.body.dateOfBirth,
        gender: req.body.gender,
        memberExternalId: req.body.memberExternalId,
        state: req.body.state,
        groupCode: req.body.groupCode,
        planId: req.body.planId,
        planDetailsId: req.body.planDetailsId,
        heightFeet: req.body.heightFeet,
        heightInches: req.body.heightInches,
        weight: req.body.weight,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        address2: req.body.address2,
        state: req.body.state,
        zip: req.body.zip,
        city: req.body.city,
      };
      data.append("primaryExternalId", member.memberExternalId);
      data.append("groupCode", member.groupCode);
      data.append("planId", member.planId);
      data.append("planDetailsId", member.planDetailsId);
      data.append("firstName", member.firstName);
      data.append("lastName", member.lastName);
      data.append("dob", member.dob);
      data.append("gender", member.gender);
      data.append("email", member.email);
      data.append("primaryPhone", member.phone);
      data.append("heightFeet", member.heightFeet);
      data.append("heightInches", member.heightInches);
      data.append("weight", member.weight);
      data.append("address", member.address);
      data.append("address2", member.address2);
      data.append("city", member.city);
      data.append("stateId", member.state);
      data.append("timezoneId", "");
      data.append("zipCode", member.zip);
      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: base + "/census/createMember",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        data: data,
      };

      return axios(config);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error creating member: " + error);
  }
}

async function createConsultationHelper(req, accessToken) {
  if (!req) throw new Error("Request is required");
  if (!accessToken) {
    accessToken = await getCensusAdminToken();
  }
  const payload = {
    modalities: [req.body.modalities],
    consultationUserId: req.body.userId,
    state: req.body.state || req.body.consultationState,
    phoneNumber: req.body.phoneNumber,
    videoConsultReadyTextNumber: req.body.phoneNumber,
    sureScriptPharmacy_id: req.body.pharmacyId,
    patientDescription: req.body.description,
    translate: req.body.translate,
    whenScheduled: req.body.whenScheduled,
    timezoneOffset: req.body.timezoneOffset,
    problems: {
      chiefComplaint: req.body.chiefComplaint,
      otherProblems: req.body.otherProblems,
    },
    roi: req.body.roi,
  };

  const config = {
    method: "post",
    url: base + "/consultation/new",
    data: { payload: JSON.stringify(payload) },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + accessToken,
    },
  };

  return axios(config);
}

async function addAttachmentHelper(req, accessToken, shouldUseWebDoctors) {
  if (!req) throw new Error("Request is required");
  if (!accessToken) {
    // accessToken = await getCensusAdminToken();
  }

  if (shouldUseWebDoctors) {
    // Assuming req.file.buffer is the buffer of the uploaded file
    const bdata = req.file.buffer.toString("base64");
    const data = JSON.stringify({
      Stream: bdata,
      ImageName: req.file.originalname,
      Description: "",
      PatientId: parseInt(req.body.userId),
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: baseWD + "/api/Reason/UploadDocument",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      data: data,
    };

    return axios.request(config);
  } else {
    var data = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    // We use buffer and originalname since the file is stored in memory
    data.append("AttachmentFile", blob, req.file.originalname);

    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/attachment/add/" + req.body.userId,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      data: data,
    };
    return axios(config);
  }
}

/* 1-1 with https://docs.getlyric.com/#8537a622-8775-4d83-8192-75944d8b847c */
/* Does this use the SSOToken or the CensusAdminToken? */
async function updateMemberTerminationDateHelper(req, termDate, accessToken) {
  if (!req) return null;
  if (!accessToken) {
    accessToken = await getCensusAdminToken();
  }
  var helperData = new FormData();
  helperData.append("groupCode", req.body.groupCode);
  helperData.append("primaryExternalId", req.body.memberExternalId);
  helperData.append("terminationDate", termDate);

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: base + "/census/updateTerminationDate",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: helperData,
  };
  return axios(config);
}

async function doesMemberExist(req, accessToken) {
  if (!req) return null;
  if (!accessToken) {
    accessToken = await getCensusAdminToken();
  }

  var data = new FormData();
  data.append("email", req.body.email);

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: base + "/census/validateEmail",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: data,
  };
  const response = await axios(config);
  if (response.data.success) {
    return !response.data.availableForUse;
  } else {
    throw new Error(response.data.message);
  }
}

/* Converts a date object to mm/dd/yyyy format
 * Does the API need UTC date? */
function dateObjToAPIDateString(dateObj) {
  if (!dateObj) return null;
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  let monthString = month.toString();
  let dayString = day.toString();
  yearString = year.toString();
  if (month < 10) {
    monthString = "0" + month;
  }
  if (day < 10) {
    dayString = "0" + day;
  }
  return monthString + "/" + dayString + "/" + yearString;
}

app.use(
  "/api-docs",
  authMiddleware,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/**
 * @swagger
 * /login/lyric:
 *   post:
 *     summary: Patient login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example123@example.com
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient created successfully
 *       400:
 *         description: Bad request. The email or password are not in the request body.
 *       500:
 *         description: Internal server error
 */
app.post("/login/lyric", async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send("Missing required fields email and/or password");
  }
  try {
    const responseLogin = await login(req.body.email, req.body.password);
    if (responseLogin.data.success) {
      var token = responseLogin.headers.authorization;
      config = {
        method: "get",
        maxBodyLength: Infinity,
        url: base + "/memberAccount/getFullAccountInfo",
        headers: {
          Authorization: token,
        },
      };
      responseUserInfo = await axios(config);
      if (responseUserInfo.data.success) {
        res.send({
          login: responseLogin.data,
          userInfo: responseUserInfo.data,
        });
      } else {
        res.status(400).send(responseUserInfo.data.message);
      }
    } else {
      res.status(400).send(response.data.message);
    }
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

/**
 * @swagger
 * /createMember:
 *   post:
 *     summary: Create a new member
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               memberExternalId:
 *                 type: string
 *               state:
 *                 type: string
 *               groupCode:
 *                  type: string
 *               planId:
 *                  type: string
 *               planDetailsId:
 *                  type: string
 *               heightFeet:
 *                  type: string
 *               heightInches:
 *                  type: string
 *               weight:
 *                  type: string
 *               address:
 *                  type: string
 *               address2:
 *                  type: string
 *               email:
 *                  type: string
 *               phone:
 *                  type: string
 *               zip:
 *                  type: string
 *
 *     responses:
 *       200:
 *         description: Member created successfully, returns a userID
 *       500:
 *         description: Something went wrong
 */
app.post("/createMember", upload.none(), async (req, res) => {
  let shouldUseWebDoctors = true;

  try {
    let accessToken = "";
    if (shouldUseWebDoctors) {
      //accessToken = await getWebDoctorsToken(req.body.email, req.body.password);
      //accessToken = accessToken.access_token;
    } else {
      //accessToken = await getCensusAdminToken();
    }

    /* Broke most out into a helper function for reuse */
    const response = await createMemberHelper(
      req,
      accessToken,
      shouldUseWebDoctors
    );
    if (shouldUseWebDoctors) {
      console.log(response);
      if (response.data) {
        if (response.data.Message) {
          res.send({
            success: false,
            message: response.data.Message,
          });
        } else {
          res.send({
            success: true,
            userid: response.data.toString(),
          }); // returns an ID
        }
      }
    }
    if (response.data.success) {
      res.send(response.data);
    } else {
      res.send(response.data.message);
    }
  } catch (error) {
    console.log(error);
    if (shouldUseWebDoctors) {
      res.send(error.response.data.Message);
    } else {
      res.send(error.response.data.message);
    }
  }
});

/**
 * @swagger
 * /newConsultation:
 *   post:
 *     summary: Create a new consultation
 *     tags: [Consultations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupCode:
 *                 type: string
 *               modalities:
 *                 type: array
 *                 items:
 *                  type: string
 *                  example: "phone or video"
 *               state:
 *                 type: string
 *                 example: "TN"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               pharmacyId:
 *                 type: int
 *                 example: 1234
 *               memberExternalId:
 *                 type: string
 *               description:
 *                 type: string
 *               translate:
 *                  type: string
 *                  example: "english or spanish"
 *               whenScheduled:
 *                  type: string
 *                  example: "now or date/time | '2016-08-01 17:30:00'"
 *               timezoneOffset:
 *                  type: string
 *                  example: "use result from timezones api, blank when scheduled as 'now'"
 *               chiefComplaint:
 *                  type: int
 *                  example: "use result from problems api"
 *               otherProblems:
 *                  type: array
 *                  items:
 *                      type: int
 *                      example: "use result from problems api"
 *               roi:
 *                  type: string
 *                  example: "What would you have done if you didn't have this service? Member selects one of the following: PCP,Urgent Care,Emergency Room,Nothing"
 *               userId:
 *                  type: string
 *                  example: "id of the user created with createMember"
 */
app.post("/newConsultation", async (req, res) => {
  try {
    let accessToken = await getCensusAdminToken();

    /* Broke most out into a helper function for reuse */
    const response = await createConsultationHelper(req, accessToken);

    if (response.data) {
      if (response.data.success) {
        res.send("Consultation created successfully");
      } else {
        res.send(response.data.message);
      }
    } else {
      res.send("Something went wrong");
    }
  } catch (error) {
    if (error.response.data) {
      res.send(error.response.data.message);
    }
  }
});
/**
 * @swagger
 * /newConsultationWithType:
 *   post:
 *     summary: Create a new consultation
 *     tags: [Consultations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupCode:
 *                 type: string
 *               modality:
 *                 type: string
 *                 example: "phone or video"
 *               state:
 *                 type: string
 *                 example: "State where member resides. Use state ID from /states."
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               pharmacyId:
 *                 type: int
 *                 example: 1234
 *               memberExternalId:
 *                 type: string
 *               description:
 *                 type: string
 *               translate:
 *                  type: string
 *                  example: "en or es"
 *               whenScheduled:
 *                  type: string
 *                  example: "now or date/time | '2016-08-01 17:30:00'"
 *               timezoneOffset:
 *                  type: string
 *                  example: "use result from timezones api, blank when scheduled as 'now'"
 *               chiefComplaint:
 *                  type: int
 *                  example: "use result from problems api"
 *               otherProblems:
 *                  type: string
 *                  items:
 *                      type: int
 *                      example: "use result from problems api. Comma separated list of problem IDs Ex: 1,2,3"
 *               roi:
 *                  type: string
 *                  example: "What would you have done if you didn't have this service? Member selects one of the following: PCP,Urgent Care,Emergency Room,Nothing"
 *               userId:
 *                  type: string
 *                  example: "id of the user created with createMember"
 *               prescriptionRefillNeeded:
 *                   type: boolean
 *                   example: true
 *               prescriptionDetails:
 *                   type: string
 *                   example: "Prescription details"
 *               provider:
 *                  type: string
 *                  example: "id returned from /providers"
 *               timeslot:
 *                  type: string
 *                  example: "id returned from /providers"
 *               type:
 *                  type: string
 *                  example: "primarycare, urgentcare, psychiatry, psychology, or dermatology"
 */
app.post("/newConsultationWithType", async (req, res) => {
  try {
    const groupCode = req.body.groupCode;
    const modality = req.body.modality;
    const state = parseInt(req.body.state);
    const phoneNumber = req.body.phoneNumber;
    const pharmacyId = parseInt(req.body.pharmacyId);
    const memberExternalId = req.body.memberExternalId;
    const description = req.body.description;
    const translate = req.body.translate;
    const whenScheduled = req.body.whenScheduled;
    const timezoneOffset = req.body.timezoneOffset;
    const chiefComplaint = parseInt(req.body.chiefComplaint);
    const otherProblems = req.body.otherProblems
      .split(",")
      .map((problem) => parseInt(problem));
    const roi = req.body.roi;
    const userId = parseInt(req.body.userId);
    let prescriptionRefillNeeded = req.body.prescriptionRefillNeeded;
    const prescriptionDetails = req.body.prescriptionDetails;
    const type = req.body.type;
    const provider = req.body.provider;
    const timeslot = req.body.timeslot;
    if (
      !groupCode ||
      !modality ||
      !state ||
      !phoneNumber ||
      !pharmacyId ||
      !memberExternalId ||
      !description ||
      !translate ||
      !whenScheduled ||
      !chiefComplaint ||
      !roi ||
      !userId ||
      !prescriptionRefillNeeded ||
      !type
    ) {
      res.status(400).send("Missing required fields");
      return;
    }
    prescriptionRefillNeeded = prescriptionRefillNeeded == "true";

    if (prescriptionRefillNeeded && !prescriptionDetails) {
      res.status(400).send("Prescription details required");
      return;
    }
    if (
      type !== "primarycare" &&
      type !== "urgentcare" &&
      type !== "psychiatry" &&
      type !== "psychology" &&
      type !== "dermatology"
    ) {
      res.status(400).send("Invalid type");
      return;
    }

    if (modality !== "phone" && modality !== "video") {
      res.status(400).send("Invalid modality");
      return;
    }

    const url = base + "/consultation/createConsultation/" + type;

    const patient = await canPatientConsult(
      memberExternalId,
      groupCode,
      type,
      res,
      modality
    );

    if (patient) {
      const patientRecords = await startConsult(
        userId,
        modality,
        res,
        type,
        memberExternalId,
        groupCode
      );

      if (patientRecords) {
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
        if (type == "urgentcare") {
          appointment_details = {
            when_scheduled: whenScheduled,
            consult_time_zone: timezoneOffset,
            preferred_language: translate,
          };
        } else {
          appointment_details = {
            provider_id: provider,
            time_slot_id: timeslot,
            consult_time_zone: "America/Chicago",
          };
        }
        const patientPayload = {
          patient: {
            user_id: userId,
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
          modality: modality,
          sureScriptPharmacy_id: pharmacyId,
          appointment_details: appointment_details,
          state: state,
          reason_for_visit: description,
          prescription_refill: {
            is_needed: false,
            prescription_details: "",
          },
          patientPhone: phoneNumber,
          labs: [],
          problems: {
            chief_complaint_id: chiefComplaint,
            other_problems: otherProblems,
          },
        };
        let accessToken = await getSSOAPIToken(memberExternalId, groupCode);
        var config = {
          method: "post",
          maxBodyLength: Infinity,
          url: url,
          data: patientPayload,
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        };

        try {
          const response = await axios(config);

          if (response.status == 200) {
            if (response.data.success) {
              res.send(response.data);
            } else {
              res.status(400).send(response.data.message);
            }
          } else {
            res.status(500).send("Something went wrong");
          }
        } catch (error) {
          res.status(400).send(error.response.data.message);
        }
      }
    }
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

canPatientConsult = async (
  memberExternalId,
  groupCode,
  type,
  res,
  modality
) => {
  let accessToken = await getSSOAPIToken(memberExternalId, groupCode);
  const url =
    base +
    "/v2/consultation/eligibility?consultation_type=" +
    type +
    "&modality=" +
    modality;

  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  try {
    const response = await axios(config);
    if (response.status == 200) {
      if (response.data.success) {
        return response.data;
      } else {
        res.status(400).send(response.data.message);
      }
    } else {
      res.status(500).send("Something went wrong");
    }
  } catch (error) {
    res.status(500).send(error.response.data.message);
  }
};
startConsult = async (
  userId,
  modality,
  res,
  type,
  memberExternalId,
  groupCode
) => {
  let accessToken = await getSSOAPIToken(memberExternalId, groupCode);
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      base +
      "/v2/consultation/" +
      type +
      "?user_id=" +
      userId +
      "&modality=" +
      modality,
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  try {
    const response = await axios(config);
    if (response.status == 200) {
      if (response.data.success) {
        return response.data;
      } else {
        res.status(400).send(response.data.message);
      }
    } else {
      res.status(500).send("Something went wrong");
    }
  } catch (error) {
    res.status(500).send(error.response.data.message);
  }
};

/**
 * @swagger
 * /states:
 *   get:
 *     summary: Retrieve all states
 *     tags: [States]
 *     responses:
 *       200:
 *         description: List of states
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 */
app.get("/states", async (req, res) => {
  let accessToken = await getCensusAdminToken();
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: base + "/states/all",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  const response = await axios(config);

  res.send(response.data);
});

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Retrieve provider availability
 *     tags: [Providers]
 *     description: This endpoint retrieves the availability of providers based on the provided criteria.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of consultation.
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's identifier.
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: The state for the consultation. Returned from /states.
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: The date for the consultation.
 *       - in: query
 *         name: memberExternalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The external ID of the member.
 *       - in: query
 *         name: groupCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The group code for the member.
 *       - in: query
 *         name: pageNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The page number for pagination.
 *     responses:
 *       200:
 *         description: A successful response with the availability data.
 *       400:
 *         description: Missing required fields.
 */
app.get("/providers", async (req, res) => {
  const type = req.query.type;
  const userId = req.query.userId;
  const state = req.query.state;
  const date = req.query.date;
  const memberExternalId = req.query.memberExternalId;
  const groupCode = req.query.groupCode;
  const pageNumber = req.query.pageNumber;
  let accessToken = await getSSOAPIToken(memberExternalId, groupCode);

  if (
    !type ||
    !userId ||
    !state ||
    !date ||
    !memberExternalId ||
    !groupCode ||
    !pageNumber
  ) {
    res.status(400).send("Missing required fields");
    return;
  }
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      base +
      "/v2/consultation/availability?consultation_type=" +
      type +
      "&userId=" +
      userId +
      "&state=" +
      state +
      "&date=" +
      date +
      "&pageNumber=" +
      pageNumber,
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  const response = await axios(config);

  res.send(response.data);
});

/**
 * @swagger
 * /pharmacies:
 *   get:
 *     summary: Search for pharmacies
 *     tags: [Pharmacies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberExternalId:
 *                 type: string
 *                 description: External ID of the member
 *                 example: "MEM12345"
 *               pharmacyName:
 *                 type: string
 *                 description: Name of the pharmacy to search for
 *                 example: "Walgreens"
 *               zip:
 *                 type: string
 *                 description: Zip code for the pharmacy search
 *                 example: "75001"
 *               groupCode:
 *                  type: string
 
 */
app.get("/pharmacies", async (req, res) => {
  try {
    let accessToken = await getSSOAPIToken(
      req.query.memberExternalId,
      req.query.groupCode
    );
    if (!accessToken) {
      res.status(500).send({ message: "Invalid credentials" });
      return;
    }
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/memberAccount/searchPharmacy",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      data: qs.stringify({
        pharmacyName: req.query.pharmacyName,
        pharmacyzipCode: req.query.zip,
      }),
    };

    const response = await axios(config);

    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

/**
 * @swagger
 * /addAttachment:
 *   post:
 *     summary: Add an attachment for a user
 *     tags: [Attachments]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: AttachmentFile
 *         type: file
 *         description: The file to upload.
 *         required: true
 *       - in: formData
 *         name: memberExternalId
 *         type: string
 *         description: External ID of the member.
 *         required: true
 *       - in: formData
 *         name: userId
 *         type: string
 *         description: ID of the user to add the attachment for.
 *         required: true
 *     responses:
 *       200:
 *         description: Attachment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 attachmentId:
 *                   type: string
 *       500:
 *         description: Something went wrong
 */
app.post(
  "/addAttachment",
  upload.single("AttachmentFile"),
  async (req, res, next) => {
    // req.file is the 'AttachmentFile' file
    // req.body will hold the text fields, if there were any
    const shouldUseWebDoctors = true;
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    try {
      let accessToken = "";
      if (shouldUseWebDoctors) {
        accessToken = await getWebDoctorsToken(
          req.body.email,
          req.body.password
        );
        accessToken = accessToken.access_token;
      } else {
        accessToken = await getCensusAdminToken();
      }
      /* Broke most out into a helper function for reuse */
      const response = await addAttachmentHelper(
        req,
        accessToken,
        shouldUseWebDoctors
      );
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

/**
 * @swagger
 * /setPreferredPharmacy:
 *   post:
 *     summary: Set a preferred pharmacy for a member
 *     tags: [Pharmacies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberExternalId:
 *                 type: string
 *                 description: External ID of the member
 *                 example: "MEM12345"
 *               pharmacyId:
 *                 type: string
 *                 description: ID of the pharmacy to set as preferred
 *                 example: "PHARM123"
 *               groupCode:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Success response indicating if the operation was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *       400:
 *         description: Bad request (e.g., missing required parameters)
 *       500:
 *         description: Server error or other issues
 */
app.post("/setPreferredPharmacy", async (req, res) => {
  try {
    let accessToken = await getSSOAPIToken(
      req.body.memberExternalId,
      req.body.groupCode
    );

    var data = new FormData();
    data.append("sureScriptPharmacyId", req.body.pharmacyId);
    data.append("isPreferred", true);

    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/memberAccount/addUserToSureScriptPharmacy",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      data: data,
    };

    const response = await axios(config);
    if (response.data) {
      res.send(response.data.success);
    } else {
      res.send(response.data.message);
    }
  } catch (error) {
    res.send(error);
  }
});

/**
 * @swagger
 * /problems:
 *   post:
 *     summary: Retrieve health record problems
 *     tags: [Health Records]
 *     parameters:
 *       - in: body
 *         name: memberExternalId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             memberExternalId:
 *               type: string
 *               description: The external ID of the member.
 *             groupCode:
 *                type: string
 *     responses:
 *       200:
 *         description: List of health record problems
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   problemName:
 *                     type: string
 *                   problemDate:
 *                     type: string
 *       400:
 *         description: Error message
 *       500:
 *         description: Something went wrong
 */
app.post("/problems", async (req, res) => {
  try {
    let accessToken = await getSSOAPIToken(
      req.body.memberExternalId,
      req.body.groupCode
    );
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: base + "/healthRecords",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    const response = await axios(config);

    if (response.data) {
      if (response.data.success) {
        res.send(response.data.problems);
      } else {
        res.send(response.data.message);
      }
    } else {
      res.send("Something went wrong");
    }
  } catch (error) {
    res.send(error);
  }
});
/**
 * @swagger
 * /timezones:
 *   post:
 *     summary: Retrieve all timezones
 *     tags: [Timezones]
 *     parameters:
 *       - in: body
 *         name: memberExternalId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             memberExternalId:
 *               type: string
 *               description: The external ID of the member.
 *             groupCode:
 *                type: string
 *     responses:
 *       200:
 *         description: List of all timezones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timezone_id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   offset:
 *                      type: string
 *       400:
 *         description: Error message
 *       500:
 *         description: Something went wrong
 */
app.get("/timezones", async (req, res) => {
  try {
    let memberExternalId = req.query.memberExternalId;
    let groupCode = req.query.groupCode;
    if (!memberExternalId || !groupCode) {
      memberExternalId = req.body.memberExternalId;
      groupCode = req.body.groupCode;
    }
    let accessToken = await getSSOAPIToken(memberExternalId, groupCode);
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: base + "/timezones/all",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    const response = await axios(config);

    if (response.data) {
      if (response.data.success) {
        res.send(response.data.timezones);
      } else {
        res.send(response.data.message);
      }
    } else {
      res.send("Something went wrong");
    }
  } catch (error) {
    res.send(error);
  }
});

/**
 * @swagger
 * /reorder:
 *   post:
 *     summary: Creates a member (if member already exists, it adds a termination date to the member), creates a consultation and then uploads a file
 *     tags: [Reorder]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: AttachmentFile
 *         type: file
 *         description: The file to upload.
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               memberExternalId:
 *                 type: string
 *               groupCode:
 *                  type: string
 *               planId:
 *                  type: string
 *               planDetailsId:
 *                  type: string
 *               heightFeet:
 *                  type: string
 *               heightInches:
 *                  type: string
 *               weight:
 *                  type: string
 *               address:
 *                  type: string
 *               address2:
 *                  type: string
 *               email:
 *                  type: string
 *               phone:
 *                  type: string
 *               zip:
 *                  type: string
 *               modalities:
 *                  type: string
 *                  example: "phone or video"
 *               consultationState:
 *                  type: string
 *                  example: "State where consultation is taking place. Use state abbreviation."
 *               memberStateId:
 *                  type: string
 *                  example: "State where member resides. Use state ID from /states."
 *               pharmacyId:
 *                  type: int
 *                  example: 1234
 *               description:
 *                  type: string
 *               translate:
 *                  type: string
 *                  example: "english or spanish"
 *               whenScheduled:
 *                  type: string
 *                  example: "now or date/time | '2016-08-01 17:30:00'"
 *               timezoneOffset:
 *                  type: string
 *                  example: "use result from timezones api, blank when scheduled as 'now'"
 *               chiefComplaint:
 *                  type: int
 *                  example: "use result from problems api"
 *               otherProblems:
 *                  type: string
 *                  example: "use result from problems api"
 *               roi:
 *                  type: string
 *                  example: "What would you have done if you didn't have this service? Member selects one of the following: PCP,Urgent Care,Emergency Room,Nothing"
 *               userId:
 *                  type: string
 *                  example: "id of the user created with createMember. If member already exists, this field is required."
 *
 *
 *     responses:
 *       200:
 *         description: Reorder completed successfully
 *       500:
 *         description: Something went wrong
 */
app.post("/reorder", upload.single("AttachmentFile"), async (req, res) => {
  /* This will be the object sent as a response that will
   * communicate what happened during the reorder process.
   * May be useful for error handling on the client's end.
   */
  let finalResponse = {
    success: false,
    createMemberData: undefined,
    terminationDateData: undefined,
    createConsultationData: undefined,
    addAttachmentData: undefined,
    error: undefined,
  };
  req.body.phoneNumber = req.body.phone;
  try {
    let accessToken = await getCensusAdminToken();
    /* Check if memeber exists */
    const doesExist = await doesMemberExist(req);
    if (!doesExist) {
      /* Create member takes state id and consultation takes state abbreviation */
      const savedStateAbbreviation = req.body.consultationState;
      req.body.state = req.body.memberStateId;
      /* Create member */
      const response = await createMemberHelper(req, accessToken);
      req.body.state = savedStateAbbreviation;

      finalResponse.createMemberData = response.data;
      /* Should this terminate here? */
      if (!response.data.success) {
        res.status(500).send(finalResponse);
        return;
      }
      req.body.userId = response.data.userid;
    } else {
      /* Update termination date */
      const rightNow = new Date();
      /* Add 6 months to current date */
      const termDateObj = new Date(rightNow.setMonth(rightNow.getMonth() + 6));
      /* Need to ensure this works as expected */
      const termDate = dateObjToAPIDateString(termDateObj);
      const response = await updateMemberTerminationDateHelper(
        req,
        termDate,
        accessToken
      );
      finalResponse.terminationDateData = response.data;
      if (!response.data.success) {
        res.status(500).send(finalResponse);
        return;
      }
    }
    /* Create consultation */
    // const consultationResponse = await createConsultationHelper(
    //   req,
    //   accessToken
    // );
    // console.log(consultationResponse);
    // finalResponse.createConsultationData = consultationResponse.data;

    // /* Add attachment */
    // const attachmentResponse = await addAttachmentHelper(req, accessToken);
    // finalResponse.addAttachmentData = attachmentResponse.data;

    // finalResponse.success =
    //   consultationResponse.data.success && attachmentResponse.data.success;

    res.send(finalResponse);
  } catch (error) {
    finalResponse.error = error.response
      ? error.response.data.message
      : error.message;
    res.status(500).send(finalResponse);
  }
});

async function getCityName(zipCode) {
  const apiKey = "AIzaSyCEMmNnlgzp6-Q6XtpE6RfWZNUtpCdU3ZY";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error("Error with geocoding API: " + data.status);
    }

    const results = data.results;
    if (results.length === 0) {
      throw new Error("No results found");
    }

    const addressComponents = results[0].address_components;
    const cityComponent = addressComponents.find((component) =>
      component.types.includes("locality")
    );

    if (!cityComponent) {
      throw new Error("City not found in address components");
    }

    return cityComponent.long_name;
  } catch (error) {
    console.error("Error fetching city name:", error);
    throw error;
    return error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
