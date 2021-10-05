/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    country: [String],
    views: {
        type: Number,
        default: 0,
    },
    last: {
        page: {
            type: String,
            required: false,
        },
    },
});

const Stats = new mongoose.model("Stats", statsSchema);

module.exports = Stats;
