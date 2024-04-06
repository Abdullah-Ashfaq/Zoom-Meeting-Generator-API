const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const db = require('./config/dbConfig')
const meetingsModel = require('./models/meetingsModel')
var mongoose = require('mongoose')

const port = 6000;

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
    url: 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=R28OZmjZTf2ankpd-HSzvw',
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
        const meeting = new meetingsModel({
            "topic": response_data.topic,
            "duration": response_data.duration,
            "startTime": response_data.start_time,
            "meetingLink": response_data.join_url
        })

        await meeting.save();

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


app.post("/createZoomWebinar", async (req, res) => {
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

        const meetingResponse = await axios.post(`https://api.zoom.us/v2/users/me/webinars`, data, { headers });

        if (meetingResponse.status !== 201) {
            return res.status(500).json({ message: 'Unable to generate meeting link' });
        }

        const response_data = meetingResponse.data;
        const meeting = new meetingsModel({
            "topic": response_data.topic,
            "duration": response_data.duration,
            "startTime": response_data.start_time,
            "meetingLink": response_data.join_url
        })

        await meeting.save();

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

// DELETE endpoint to delete a meeting by ID
app.delete('/meetings/:id', async (req, res) => {
    try {
      const meetingId = req.params.id;
  
      // Check if the provided ID is valid
      if (!mongoose.Types.ObjectId.isValid(meetingId)) {
        return res.status(400).json({ error: 'Invalid meeting ID' });
      }
  
      // Find the meeting by ID and delete it
      const deletedMeeting = await meetingsModel.findByIdAndDelete(meetingId);
  
      // Check if the meeting exists
      if (!deletedMeeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }
  
      res.status(200).json({ message: 'Meeting deleted successfully', deletedMeeting });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/getAllMeetings", async (req, res) => {
    try {
        // Retrieve all meetings from the database
        const meetings = await meetingsModel.find({});
        
        // Check if meetings exist
        if (meetings.length === 0) {
            // No meetings found
            return res.status(404).json({ message: "No meetings found" });
        }
        
        // Return the meetings as a JSON response
        res.status(200).json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/getPastMeetingRecord", async (req, res) => {
    try {
        const meetingId = 86406989624;
        let authResponse;

        await axios.request(zoomConfig)
            .then((response) => {
                authResponse = response.data;
            })
            .catch((error) => {
                console.log(error);
            });

        const access_token = authResponse.access_token;
        console.log(access_token, "tokennnnnnnnnnnnnnnnnn")

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        };

        const meetingResponse = await axios.get(`https://api.zoom.us/v2/report/meetings/${meetingId}/participants`, { headers });
        console.log(meetingResponse.data, "meetingggggggggg resppppp")
        return res.status(200).json({message: true, data: meetingResponse.data})
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/", (req, res) => {
    console.log("project is running");
    return res.status(200).json({ message: "project is running" });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
