var mongoose = require('mongoose')

var Schema = mongoose.Schema;
 var meetings = new Schema({
    "topic": String,
    "duration": Number,
    "startTime":Date,
    "meetingLink": String,
    "password": String
    
});
module.exports = mongoose.model('meetings', meetings);