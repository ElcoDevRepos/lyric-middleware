const express = require("express");
const axios = require("axios");
const router = express.Router();
const qs = require("qs");

const baseWD =
  process.env.ENVIRONMENT == "staging"
    ? "https://stgwbclientapi.azurewebsites.net"
    : "https://wbclientapi.webdoctors.com";

async function getWebDoctorsToken() {
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
/**
 * @swagger
 * /patient:
 *   get:
 *     summary: Retrieve patient details by ID
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the patient
 *     responses:
 *       200:
 *         description: Details of the patient
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/patient", async (req, res) => {
  try {
    const { id } = req.query;
    let accessToken = await getWebDoctorsToken();
    accessToken = accessToken.access_token;

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${baseWD}/api/patient?id=${id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios.request(config);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

/**
 * @swagger
 * /conditions:
 *   get:
 *     summary: Get conditions for a patient
 *     tags: [Reason]
 *     parameters:
 *       - in: query
 *         name: PatientId
 *         required: false
 *         schema:
 *           type: integer
 *         description: The ID of the patient
 *     responses:
 *       200:
 *         description: List of conditions
 *       500:
 *         description: Internal server error
 */
router.get("/conditions", async (req, res) => {
  try {
    accessToken = await getWebDoctorsToken();
    accessToken = accessToken.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: baseWD + "/api/reason/conditions?PatientId=" + req.query.patientId,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const response = await axios.request(config);
    if (response.data) {
      res.send(response.data);
    } else {
      res.send("Something went wrong");
    }
  } catch (error) {
    res.send(error);
  }
});

/**
 * @swagger
 * /symptoms:
 *   get:
 *     summary: Get symptoms for a condition
 *     tags: [Reason]
 *     parameters:
 *       - in: query
 *         name: conditionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the condition
 *     responses:
 *       200:
 *         description: List of symptoms
 *       500:
 *         description: Internal server error
 */
router.get("/symptoms", async (req, res) => {
  try {
    accessToken = await getWebDoctorsToken();
    accessToken = accessToken.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: baseWD + "/api/reason/symptoms?conditionId=" + req.query.conditionId,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const response = await axios.request(config);
    if (response.data) {
      res.send(response.data);
    } else {
      res.send("Something went wrong");
    }
  } catch (error) {
    res.send(error);
  }
});

/**
 * @swagger
 * /createConsultationWebDoctors:
 *   post:
 *     summary: Patient login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: returned from createMember
 *               reasonId:
 *                 type: use /conditions
 *               symptomIds:
 *                 type: use /symptoms?conditionId
 *     responses:
 *       200:
 *         description: Patient created successfully
 *       400:
 *         description: Bad request. The email or password are not in the request body.
 *       500:
 *         description: Internal server error
 */
router.post("/createConsultationWebDoctors", async (req, res) => {
  try {
    accessToken = await getWebDoctorsToken();
    accessToken = accessToken.access_token;

    const data = {
      PatientId: req.body.patientId,
      ReasonId: req.body.reasonId,
      SymptomIds: req.body.symptomIds,
      CreatedBy: req.body.patientId,
    };
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: baseWD + "/api/encounter/create",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      data: JSON.stringify(data),
    };
    const response = await axios.request(config);
    if (response.data) {
      res.send({
        message: "Consultation created",
        success: true,
        id: response.data,
      });
    } else {
      res.send({ message: "Something went wrong", success: false });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = router;
