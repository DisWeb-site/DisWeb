/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const apiLimiter = require("../controllers/apiLimiter");
const express = require("express");
const router = express.Router();
//POST /stats/:botId
router.post("/stats/:botId", apiLimiter, async (req, res) => {
    const { client } = req;
    res.type("json");
    const { botId } = req.params;
    const stats = req.body;
    if (!stats) {
        return res
            .status(400)
            .json({ error: true, message: "No body provided in request" });
    } else if (!stats.serverCount && !stats.shardCount) {
        return res.status(400).json({
            error: true,
            message: "Either Server count or Shard count should be provided",
        });
    }
    const { botDB } = await client.util.fetchBot(botId, true);
    if (!botDB) {
        return res
            .status(400)
            .json({ error: true, message: "Can't find bot. Check the bot ID" });
    }
    botDB.stats = stats;
    botDB.markModified("stats");
    await botDB.save();
    res.json({ error: false, message: "Updated bot stats" });
    res.end();
});
module.exports = router;
