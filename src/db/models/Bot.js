const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
    botId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        required: true,
    },
    descriptions: {
        short: {
            type: String,
            trim: true,
            required: true,
        },
        long: {
            type: String,
            trim: false,
            required: true,
        },
    },
    github: {
        type: String,
        required: false,
    },
    support: {
        type: String,
        required: false,
    },
    website: {
        type: String,
        required: false,
    },
    owner: {
        type: String,
        required: true,
    },
    analytics: {
        votes: {
            type: Number,
            default: 0,
        },
        invites: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        lastVotedUsers: [String],
        countries: [String],
    },
    stats: {
        serverCount: {
            type: Number,
            default: 0,
        },
    },
    addedAt: {
        type: Number,
        required: true,
    },
    apiToken: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
});

const Bot = new mongoose.model("Bot", botSchema);

module.exports = Bot;
