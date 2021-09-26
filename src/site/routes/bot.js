/**
 * DisList
 * Copyright (c) 2021 The DisList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /bot/:botId
router.get("/:botId", async (req, res) => {
    const { client } = req;
    const id = req.params.botId;
    const botData = await client.util.fetchBot(id);
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    const { bot, botDB } = botData;
    if (isNaN(botDB.analytics.views)) botDB.analytics.views = 0;
    botDB.analytics.views++;
    await botDB.save();
    let owner = null;
    try {
        owner = await client.users.fetch(botDB.owner);
    } catch (e) {
        if (client.debug) console.log(e);
    }
    res.render("bot", {
        req,
        bot,
        botDB,
        owner,
    });
});
//GET /bot/:botId/edit
router.get("/:botId/edit", CheckAuth, async (req, res) => {
    const { client } = req;
    const id = req.params.botId;
    const botData = await client.util.fetchBot(id);
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    const { bot, botDB } = botData;
    if (botDB.owner !== req.user.id) {
        return res.redirect(
            "/bots?error=true&message=" +
                encodeURIComponent("You are not this bot's owner!!")
        );
    }
    res.render("bot", {
        req,
        bot,
        botDB,
    });
});
//POST /bot/:botId/edit
router.get("/:botId/edit", CheckAuth, async (req, res) => {
    const { client } = req;
    const id = req.params.botId;
    const botData = await client.util.fetchBot(id);
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    const { bot, botDB } = botData;
    if (botDB.owner !== req.user.id) {
        return res.redirect(
            "/bots?error=true&message=" +
                encodeURIComponent("You are not this bot's owner!!")
        );
    }
    //edit bot backend, not done yet
});
module.exports = router;
