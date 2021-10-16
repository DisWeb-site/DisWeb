/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
    userId: {
        type: String,
        //unique: true,
        required: true,
    },
    botId: {
        type: String,
        required: true,
    },
    votedAt: {
        type: Number,
        required: true,
    },
});

const Vote = new mongoose.model("Vote", voteSchema);

module.exports = Vote;
