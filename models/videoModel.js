const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videoName: {
        type: String,
        required: true,
    },
    thumbnailName: {
        type: String,
        required: true,
        default: 'default.png'
    },
    views: {
        type: Number,
        default:0
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref:'Users'
    }
})

const Videos = mongoose.model('Videos', videoSchema);
module.exports = Videos;