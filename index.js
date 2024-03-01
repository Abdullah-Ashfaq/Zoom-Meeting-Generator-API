const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const accountId = process.env.ACCOUNTID;
const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const apiBaseUrl = "https://api.zoom.us/v2";
const authTokenUrl = "https://zoom.us/oauth/token";
const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

console.log(accountId, clientSecret, "env file data");

const zoomConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=w6fvhDO1RMq2_eCPlhBxxw',
    headers: {
        'Authorization': `Basic ${base64Credentials}`
    }
};

app.post("/createZoomMeeting", async (req, res) => {
    try {
        const { topic, duration, start_time } = req.body;

        let authResponse;

        await axios.request(zoomConfig)
            .then((response) => {
                authResponse = response.data;
            })
            .catch((error) => {
                console.log(error);
            });

        const access_token = authResponse.access_token;

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        };

        const data = {
            "topic": topic,
            "type": 2,
            "start_time": start_time,
            "duration": duration,
            "password": "12334",
            "settings": {
                "join_before_host": true,
                "waiting_room": false
            }
        };

        const meetingResponse = await axios.post(`${apiBaseUrl}/users/me/meetings`, data, { headers });

        if (meetingResponse.status !== 201) {
            return res.status(500).json({ message: 'Unable to generate meeting link' });
        }

        const response_data = meetingResponse.data;

        const content = {
            meeting_url: response_data.join_url,
            meetingTime: response_data.start_time,
            purpose: response_data.topic,
            duration: response_data.duration,
            message: 'Success',
            password: response_data.password,
            status: 1
        };

        return res.status(200).json(content);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/", (req, res) => {
    console.log("project is running");
    return res.status(200).json({ message: "project is running" });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
