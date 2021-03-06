/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { MessageEmbed } = require("discord.js");
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /bots
router.get("/", async (req, res) => {
    const bots = await req.client.models.Bot.find({});
    bots.forEach(async ({ botId }) => {
        await req.client.users.fetch(botId);
    });
    res.render("bots/index", {
        req,
        bots: bots.filter((b) => b.approved),
        allBots: bots,
        promotedBots: bots
            .filter((b) => b.approved)
            .filter((b) => {
                if (!req.client.servers.main) return;
                const m = req.client.servers.main.members.cache.get(b.botId);
                return m.roles.cache.has(req.client.config.roles?.promoted);
            }),
    });
});
//GET /bots/add
router.get("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const guild = client.guilds.cache.get(client.config.servers.main.id);
    let member = null;
    try {
        member = await guild.members.fetch(req.user.id);
    } catch (e) {
        if (client.debug) console.log(e);
    }
    if (!member)
        return res.redirect(
            "/bots?error=true&message=" +
                encodeURIComponent(
                    "To do this, you have to join our discord server."
                )
        );
    res.render("bots/add", {
        req,
    });
});
//GET /bots/rules
router.get("/rules", (req, res) => {
    res.render("bots/rules", {
        req,
    });
});
//POST /bots/add
router.post("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const params = new URLSearchParams();
    const data = req.body;
    const { botId } = data;
    let bot = null;
    try {
        bot = await client.users.fetch(botId);
    } catch (e) {
        if (client.debug) console.log(e);
        params.set("message", "Invalid bot ID");
        return res.redirect(`/bots/add?${params}`);
    }
    if (client.debug) console.log(data);
    const reqFields = ["shortDesc", "longDesc", "prefix"];
    let check = null;
    try {
        check = await client.models.Bot.findOne({ botId });
    } catch (e) {
        //nothing required to be done, if error ocurres then the bot is not in the db already
    }
    params.set("error", "true");
    if (isNaN(botId)) {
        params.set("message", "Bot ID is not a number");
        return res.redirect(`/bots/add?${params}`);
    } else if (check) {
        params.set("message", "Bot already exists in DB");
        return res.redirect(`/bots/add?${params}`);
    }
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        if (!Object.keys(data).includes(field)) {
            params.set("message", "Required fields are missing");
            return res.redirect(`/bots/add?${params}`);
        }
    }
    const botData = await client.util.handleBotData({
        ...data,
        owner: req.user.id,
    });
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    if (client.debug) client.logger.debug("Adding bot to DB");
    const botDB = new client.models.Bot(botData);
    await botDB.save();
    const botLogs = await client.channels.fetch(client.config.channels.botLogs);
    const embed = new MessageEmbed()
        .setTitle("New Bot Added")
        .setDescription(`${bot} (${bot.id}) is added by <@${botDB.owner}>`);
    botLogs.send({
        embeds: [embed],
    });
    params.delete("error");
    params.set("success", "true");
    params.set("message", "Your bot is added!");
    res.redirect(`/bot/${botId}?${params}`);
});
module.exports = router;
