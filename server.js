const express = require("express");
const axios = require("axios");
const qs = require("qs");
const auth = require("basic-auth");

var bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const multer = require("multer");
const upload = multer();
let Blob;

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
const base = "https://portal.getlyric.com/go/api";
// Middleware to handle JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
async function getSSOAPIToken(memberExternalId, groupCode) {
  try {
    var data = new FormData();
    data.append("email", "MTMAIM01SSO@mytelemedicine.com");
    data.append("password", "CdGt{[1qIQ,+[xZZ@K3Q");
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/login",
      data: data,
    };
    var response = await axios(config);

    if (response.data) {
      if (response.data.success) {
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
          console.log(response.data);

          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getCensusAdminToken() {
  var data = new FormData();
  data.append("email", "MTMAIM01@mytelemedicine.com");
  data.append("password", "!vse5d4BzL1s0u#irN@!");
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: base + "/login",
    data: data,
  };
  var response = await axios(config);
  if (response.data) {
    if (response.data.success) {
      var token = response.headers.authorization;
      token = token.replace("Bearer ", "").trim();
      return token;
    }
  }
}

app.use(
  "/api-docs",
  authMiddleware,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

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
 *         description: Member created successfully
 *       500:
 *         description: Something went wrong
 */
app.post("/createMember", async (req, res) => {
  try {
    let accessToken = await getCensusAdminToken();

    let member = {
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
    };

    var data = new FormData();
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

    const response = await axios(config);
    if (response.data.success) {
      console.log(response);
      res.send(response.data);
    } else {
      res.send(response.data.message);
    }
  } catch (error) {
    console.log(error);
    res.send(error.response.data.message);
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
 *                roi:
 *                  type: string
 *                  example: "What would you have done if you didn't have this service? Member selects one of the following: PCP,Urgent Care,Emergency Room,Nothing"
 *                userId:
 *                  type: string
 *                  example: "id of the user created with createMember"
 *

 */
app.post("/newConsultation", async (req, res) => {
  try {
    let accessToken = await getCensusAdminToken();

    const payload = {
      modalities: req.body.modalities,
      consultationUserId: req.body.userId,
      state: req.body.state,
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

    console.log(payload);
    const config = {
      method: "post",
      url: base + "/consultation/new",
      data: { payload: JSON.stringify(payload) },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + accessToken,
      },
    };

    const response = await axios(config);
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
 * /pharmacies:
 *   post:
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
app.post("/pharmacies", async (req, res) => {
  try {
    let accessToken = await getSSOAPIToken(
      req.body.memberExternalId,
      req.body.groupCode
    );
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: base + "/memberAccount/searchPharmacy",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      data: qs.stringify({
        pharmacyName: req.body.pharmacyName,
        pharmacyzipCode: req.body.zip,
      }),
    };

    const response = await axios(config);

    res.send(response.data);
  } catch (error) {
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
  async (req, res) => {
    try {
      let accessToken = await getCensusAdminToken();
      var data = new FormData();
      const blob = new Blob([req.file.buffer]);

      // Use the stream when appending to FormData
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

      const response = await axios(config);
      res.send(response.data);
    } catch (error) {
      console.log(error.response);
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
    console.log(response);
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
 *                    offset:
 *                      type: string
 *       400:
 *         description: Error message
 *       500:
 *         description: Something went wrong
 */
app.get("/timezones", async (req, res) => {
  try {
    let accessToken = await getSSOAPIToken(
      req.body.memberExternalId,
      req.body.groupCode
    );
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

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
