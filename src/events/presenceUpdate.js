/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
    name: "presenceUpdate",
    once: false,
    async execute(client, oldPresence, newPresence) {
        if (
            !newPresence.user.bot ||
            newPresence?.status === oldPresence?.status ||
            newPresence.guild.id !== client.config.servers.main.id
        ) {
            if (client.debugLevel > 4)
                client.logger.debug(
                    "The user is not a bot || old status === new status || The update was not from main guild",
                    "presenceUpdate"
                );
            return;
        }
        const { botDB } = await client.util.fetchBot(newPresence.user.id, true);
        if (!botDB) {
            if (client.debugLevel > 1)
                client.logger.debug(
                    "Bot not found in db so ignoring",
                    "presenceUpdate"
                );
            return;
        }
        const { user } = newPresence;
        let rate = botDB.uptime?.rate ?? 99;
        const uptimeLogs = await client.channels.fetch(
            client.config.channels.uptimeLogs
        );
        const makeEmbed = (botStatus = "offline", duration = null) => {
            const embed = new MessageEmbed()
                .setAuthor(user.tag, user.displayAvatarURL())
                .setTitle(
                    `${client.config.emojis?.[botStatus]} Your bot ${
                        user.tag
                    } ${
                        botStatus === "offline"
                            ? "went offline"
                            : "came back online"
                    }!`
                )
                .setColor(botStatus === "offline" ? "RED" : "AQUA")
                .addField("**Uptime Rate**", `${rate}%`);
            if (duration) embed.addField("**Duration**", `${duration}`);
            return { content: `<@${botDB.owner}>`, embeds: [embed] };
        };
        let reply, msg;
        switch (newPresence?.status?.toLowerCase?.()) {
            case "offline":
                reply = makeEmbed("offline");
                msg = await uptimeLogs.send(reply);
                botDB.uptime.log = msg.id;
                botDB.uptime.lastOfflineAt = Date.now();
                break;
            case "online":
            case "dnd":
            case "idle":
                const duration = moment.duration(
                    moment(botDB.uptime.lastOfflineAt).diff(
                        new Date().getTime()
                    )
                );
                const hours = duration.hours();
                if (hours > 0) {
                    rate = rate - hours;
                }
                reply = makeEmbed("online", duration.humanize());
                try {
                    msg = await uptimeLogs.messages.fetch(
                        `${botDB.uptime?.log}`
                    );
                    msg.edit(reply);
                } catch (e) {
                    uptimeLogs.send(reply);
                }
                botDB.uptime.log = null;
                botDB.uptime.lastOfflineAt = null;
                break;
            default:
                console.log(`Unknown status: ${newPresence.status}`);
                break;
        }
        await botDB.save();
    },
};
