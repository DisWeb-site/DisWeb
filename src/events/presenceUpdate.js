/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { MessageEmbed } = require("discord.js");
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
        const makeEmbed = (botStatus = "offline") => {
            const em = new MessageEmbed()
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
                .addField("**Uptime Rate**", rate);
            return em;
        };
        let embed, msg;
        switch (newPresence?.status?.toLowerCase?.()) {
            case "offline":
                embed = makeEmbed("offline");
                msg = await uptimeLogs.send({ embeds: [embed] });
                botDB.uptime.log = msg.id;
                botDB.uptime.lastOfflineAt = Date.now();
                break;
            case "online":
            case "dnd":
            case "idle":
                embed = makeEmbed("online");
                try {
                    msg = await uptimeLogs.messages.fetch(
                        `${botDB.uptime?.log}`
                    );
                    msg.edit({ embeds: [embed] });
                } catch (e) {
                    uptimeLogs.send({ embeds: [embed] });
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
