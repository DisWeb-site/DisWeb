/**
 * UpList
 * Copyright (c) 2021 The UpList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const express = require("express");
const router = express.Router();
//POST /stats/:botId
router.post("/stats/:botId", async (req, res) => {
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
    const botData = await client.util.fetchBot(botId);
    const { botDB } = botData;
    if (!botDB) {
        return res
            .status(400)
            .json({ error: true, message: "Can't find bot. Check the bot ID" });
    }
    botDB.stats = stats;
    botDB.markModified("stats");
    await botDB.save();
    res.json({ error: false, message: "Updated server count" });
    res.end();
});
module.exports = router;
