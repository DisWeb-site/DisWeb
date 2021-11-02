/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
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
        joins: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        countries: [String],
    },
    addedAt: {
        type: Number,
        required: true,
    },
    apiToken: {
        type: String,
        required: true,
    },
});

const Guild = new mongoose.model("Guild", guildSchema);

module.exports = Guild;
