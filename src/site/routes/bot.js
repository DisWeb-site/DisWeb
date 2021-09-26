/**
 * DisList
 * Copyright (c) 2021 The DisList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const geoip = require("geoip-lite");
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
    if (!botDB.approved && (!req.user || req.user.id !== botDB.owner)) return res.redirect(`/bots/add?error=true&message=${encodeURIComponent("Bot is not approved so you can't view it.<br>\nIf you are this bot's owner then please login and try again")}`);
    const { country } = axios.get(`https://ipinfo/${req.ip}`);
    if (req.user.id !== botDB.owner) {
        if (isNaN(botDB.analytics.views)) botDB.analytics.views = 0;
        botDB.analytics.views++;
        botDB.analytics.countries.push(country);
        await botDB.save();
    }
    let owner = null;
    try {
        owner = await client.users.fetch(botDB.owner);
    } catch (e) {
        if (client.debug) console.log(e);
    }
    res.render("bot/index", {
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
    res.render("bot/edit", {
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
//GET /bot/:botId/analytics
router.get("/:botId/analytics", CheckAuth, async (req, res) => {
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
    res.render("bot/analytics", {
        req,
        bot,
        botDB,
    });
});
module.exports = router;
