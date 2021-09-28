/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
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
        shardCount: {
            type: Number,
            required: false,
        },
    },
    addedAt: {
        type: Number,
        required: true,
    },
    approvedAt: {
        type: Number,
        default: 0,
    },
    apiToken: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    uptime: {
        rate: {
            type: Number,
            default: 99,
        },
        log: {
            type: String,
            required: false,
        },
    },
});

const Bot = new mongoose.model("Bot", botSchema);

module.exports = Bot;
