/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { MessageEmbed } = require("discord.js");
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /servers
router.get("/", async (req, res) => {
    const guilds = await req.client.models.Guild.find({});
    guilds.forEach(async ({ guildId }) => {
        try {
            await req.client.guilds.fetch(guildId);
            // eslint-disable-next-line no-empty
        } catch (e) {}
    });
    res.render("servers/index", {
        req,
        guilds,
    });
});
//GET /servers/add
router.get("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const guild = client.servers.main;
    let member = null;
    try {
        member = await guild.members.fetch(req.user.id);
    } catch (e) {
        if (client.debug) console.log(e);
    }
    if (!member)
        return res.redirect(
            "/servers?error=true&message=" +
                encodeURIComponent(
                    "To do this, you have to join our discord server."
                )
        );
    res.render("servers/add", {
        req,
    });
});
//GET /servers/rules
router.get("/rules", (req, res) => {
    res.render("servers/rules", {
        req,
    });
});
//POST /servers/add
router.post("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const params = new URLSearchParams();
    const data = req.body;
    const { guildId } = data;
    let guild, member;
    try {
        guild = client.guilds.cache.get(guildId);
        member = await guild.members.fetch(req.user.id);
    } catch (e) {
        if (!guild) {
            guild = null;
            member = null;
        }
    }
    const reqFields = ["shortDesc", "longDesc"];
    let check = null;
    try {
        check = await client.models.Guild.findOne({ guildId });
    } catch (e) {
        //nothing required to be done, if error ocurres then the bot is not in the db already
    }
    if (!data.invite) {
        try {
            data.invite = await guild.channels.cache
                .filter((c) => c.type === "GUILD_TEXT")
                .first()
                .createInvite({
                    maxAge: 0,
                    unique: true,
                    reason: `This server was added to DisWeb server list by ${req.user.tag}`,
                });
        } catch (e) {
            data.invite = null;
        }
    }
    params.set("error", "true");
    if (!guild || isNaN(guildId)) {
        params.set(
            "message",
            `You have to add me to that server first<br>\n<a href="${client.config.invite(
                client
            )}">Invite Me</a>`
        );
        return res.redirect(`/servers/add?${params}`);
    } else if (check) {
        params.set("message", "Server already exists in DB");
        return res.redirect(`/servers/add?${params}`);
    } else if (!member || !member.permissions.has("MANAGE_GUILD")) {
        params.set(
            "message",
            "You must join that server & you must be having the Manage Server permission in that server to add it"
        );
        return res.redirect(`/servers/add?${params}`);
    } else if (!data.invite) {
        params.set(
            "message",
            "I can't create invites, either give me the create instant invite permission or you create an invite yourself and drop the link in the invite input box"
        );
        return res.redirect(`/servers/add?${params}`);
    }
    if (client.debug) console.log(data);
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        if (!Object.keys(data).includes(field)) {
            params.set("message", "Required fields are missing");
            return res.redirect(`/servers/add?${params}`);
        }
    }
    const guildData = await client.util.handleGuildData({
        ...data,
        owner: req.user.id,
    });
    if (typeof guildData === "string") {
        return res.redirect(guildData);
    }
    if (client.debug) client.logger.debug("Adding server to DB");
    const guildDB = new client.models.Guild(guildData);
    await guildDB.save();
    const serverLogs = await client.channels.fetch(
        client.config.channels.serverLogs
    );
    const embed = new MessageEmbed()
        .setTitle("New Server Added")
        .setDescription(
            `${guild.name} (${guild.id}) is added by <@${guildDB.owner}>`
        );
    serverLogs.send({
        embeds: [embed],
    });
    params.delete("error");
    params.set("success", "true");
    params.set("message", "Your server is added!");
    res.redirect(`/server/${guildId}?${params}`);
});
module.exports = router;
