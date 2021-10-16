/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const axios = require("axios");
const moment = require("moment");
require("moment-duration-format");
const { MessageEmbed } = require("discord.js");
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
    let member;
    try {
        if (req.user)
            member = await client.guilds.cache
                .get(client.config.servers.main.id)
                .members.fetch(req.user.id);
    } catch (e) {} //eslint-disable-line no-empty
    let reviewerCheck = false;
    if (req.user && !botDB.approved) {
        if (
            typeof client.config.roles.reviewer === "string" &&
            member.roles.cache.has(client.config.roles.reviewer)
        ) {
            reviewerCheck = true;
        } else if (typeof client.config.roles.reviewer !== "string") {
            const has = [];
            member.roles.cache.forEach((r) => {
                if (client.config.roles.reviewer.includes(r.id)) has.push(r.id);
            });
            if (has && has.length && has[0]) reviewerCheck = true;
        }
    }
    if (
        !botDB.approved &&
        (!req.user || (req.user.id !== botDB.owner && !reviewerCheck))
    )
        return res.redirect(
            `/bots/add?error=true&message=${encodeURIComponent(
                "Bot is not approved so you can't view it.<br>\nIf you are this bot's owner then please login and try again"
            )}`
        );
    if (!req.user || req.user.id !== botDB.owner) {
        if (isNaN(botDB.analytics.views)) botDB.analytics.views = 0;
        botDB.analytics.views++;
        if (process.env.IPINFO_KEY) {
            const res = await axios.get(
                `https://ipinfo.io/${req.ip}?token=${process.env.IPINFO_KEY}`
            );
            if (res.data.country)
                botDB.analytics.countries.push(res.data.country);
            else if (client.debug) console.log(res);
        }
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
        redirectAfterDeleteURL: `${(new URL(req.currentURL).pathname =
            "/bots")}`,
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
router.post("/:botId/edit", CheckAuth, async (req, res) => {
    const { client } = req;
    const params = new URLSearchParams();
    const { botId } = req.params;
    const data = req.body;
    let botData = await client.util.fetchBot(botId);
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
    if (client.debug) console.log(data);
    const reqFields = ["shortDesc", "longDesc", "prefix"];
    params.set("error", "true");
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        if (!Object.keys(data).includes(field)) {
            params.set("message", "Required fields are missing");
            return res.redirect(`/bots/add?${params}`);
        }
    }
    botData = await client.util.handleBotData({
        ...data,
        owner: req.user.id,
        botId,
    });
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    if (client.debugLevel > 0) console.log("Submitted bot data", botData);
    /*const diff = `${client.util
        .diff(Object.values(botData), Object.values(botDB.toJSON()))
        .join("\n")}`;*/
    for (const i in botData) {
        botDB[i] = botData[i];
    }
    if (client.debugLevel > 0) console.log("DB data after modification", botDB);
    await botDB.save();
    const botLogs = await client.channels.fetch(client.config.channels.botLogs);
    const embed = new MessageEmbed()
        .setTitle("Bot Edited")
        .setDescription(`${bot} (${bot.id}) is edited`)
        .addField("**Owner**", `<@${botDB.owner}> (${botDB.owner})`);
    //.addField("**Diff**", "```diff" + diff + "```");
    botLogs.send({
        content: `<@${req.user.id}>`,
        embeds: [embed],
    });
    params.delete("error");
    params.set("success", "true");
    params.set("message", "Successfully edited your bot!");
    res.redirect(`/bot/${botId}?${params}`);
});
//GET /bot/:botId/analytics
router.get("/:botId/analytics", CheckAuth, async (req, res) => {
    const { client } = req;
    const { countries } = client.data;
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
        countries,
        dups: client.util.findArrDups2(botDB.analytics.countries),
    });
});
//DELETE /bot/:botId/
router.delete("/:botId/", CheckAuth, async (req, res) => {
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
    const member = await client.guilds.cache
        .get(client.config.servers.main.id)
        .members.fetch(bot.id);
    if (member.kickable) member.kick();
    else
        client.logger.error(
            `${bot.tag} (${bot.id}) has been deleted from the db, but it can't be kicked in the main server`
        );
    await client.models.Bot.findOneAndDelete({ botId: botDB.botId });
    const botLogs = await client.channels.fetch(client.config.channels.botLogs);
    const embed = new MessageEmbed()
        .setTitle(`Bot Deleted ${client.config.emojis.deleted}`)
        .setDescription(`${bot} is deleted! :x:`)
        .addField("Reason", `Deleted by owner himself`);
    const reply = {
        content: `<@${botDB.owner}>`,
        embeds: [embed],
    };
    botLogs.send(reply);
    //const owner = (await this.client.users.fetch(data.owner)) ?? null;
    //if (owner) owner.send(reply);
    //res.redirect(`/bots?success=true&message=${encodeURIComponent("Bot Deleted")}`);
    res.sendStatus(200);
});
//GET /bot/:botId/vote
router.get("/:botId/vote", CheckAuth, async (req, res) => {
    const { client } = req;
    const id = req.params.botId;
    const botData = await client.util.fetchBot(id);
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    const { bot, botDB } = botData;
    if (!botDB.approved)
        return res.redirect(
            `/bots?error=true&message=${encodeURIComponent(
                "Sorry, Only approved bots can be voted"
            )}`
        );
    res.render("bot/vote", {
        req,
        bot,
        botDB,
        redirectAfterVoteURL: `${(new URL(
            req.currentURL
        ).pathname = `/bot/${bot.id}`)}`,
    });
});
//PUT /bot/:botId/vote
router.put("/:botId/vote", CheckAuth, async (req, res) => {
    const { client } = req;
    const id = req.params.botId;
    if (!req.user) return res.redirect(`/${id}/vote`);
    const botData = await client.util.fetchBot(id);
    if (typeof botData === "string") {
        return res.redirect(botData);
    }
    const { bot, botDB } = botData;
    let vote;
    try {
        vote = await client.models.Vote.find({
            botId: bot.id,
            userId: req.user.id,
        })
            .then((votes) => votes)
            .catch((e) => {
                throw e;
            });
    } catch (e) {
        if (client.debugLevel > 1) console.log(e);
    }
    vote = vote.at(-1);
    if (vote) {
        const diff =
            12 * 60 * 60 * 1000 - //12 hours
            (new Date().getTime() - vote.votedAt);
        if (diff > 0) {
            const hours = Math.round(diff / (1000 * 60 * 60));
            let duration;
            if (hours == 24) {
                duration = moment.duration(hours, "hours");
            } else if (hours == 0) {
                const minutes = Math.ceil(diff / (1000 * 60));
                duration = moment.duration(minutes, "minutes");
            } else {
                duration = moment.duration(hours, "hours");
            }
            duration = duration.humanize();
            return res.redirect(
                `/bot/${bot.id}?error=true&message=${encodeURIComponent(
                    `You have already voted in the last 12 hours. Try again in ${duration}`
                )}`
            );
        }
    } else if (client.debug) {
        client.logger.debug(
            `There was no vote found in db for ${req.user.tag} (${req.user.id}), so I guess this user didn't vote in last 12 hours`
        );
    }
    vote = new client.models.Vote({
        botId: bot.id,
        userId: req.user.id,
        votedAt: new Date().getTime(),
    });
    await vote.save();
    if (isNaN(botDB.analytics.votes)) botDB.analytics.votes = 0;
    botDB.analytics.votes = botDB.analytics.votes + 1;
    await botDB.save();
    let voteLogs;
    try {
        voteLogs = await client.channels.fetch(client.config.channels.voteLogs);
        // eslint-disable-next-line no-empty
    } catch (e) {}
    const embed = new MessageEmbed()
        .setTitle(`${req.user.tag} voted for ${bot.tag}`)
        .setDescription(`${bot} (${bot.id})`);
    if (voteLogs)
        voteLogs.send({
            embeds: [embed],
        });
    else client.logger.error("Can't get channels.voteLogs");
    res.redirect(
        `${(new URL(
            req.currentURL
        ).pathname = `/bot/${bot.id}`)}?success=true&message=${encodeURIComponent(
            "Sucessfully voted for bot"
        )}`
    );
});
module.exports = router;
