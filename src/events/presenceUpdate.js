const { MessageEmbed } = require("discord.js");

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
        if (!newPresence.user.bot || newPresence?.status === oldPresence?.status || newPresence.guild.id !== client.config.servers.main.id) return;
        const { botDB } = await client.util.fetchBot(newPresence.user.id, true);
        if (!botDB) return;
        const { user } = newPresence;
        let rate = botDB.uptime?.rate ?? 99;
        const uptimeLogs = await client.channels.fetch(client.config.channels.uptimeLogs);
        const makeEmbed = () => {
            const embed = new MessageEmbed(botStatus)
                .setAuthor(user.tag, user.displayAvatarURL())
                .setTitle(`${client.config.emojis?.[botStatus]} Your bot ${user.tag} ${botStatus === "offline" ? "went offline" : "came back online"}!`)
                .setDescription(`It is **${user}** this bot!`)
                .addField("**Uptime Rate**", rate);
            return embed;
        }
        switch(newPresence?.status?.toLowerCase?.()) {
            case "offline":
                const embed = makeEmbed("offline");
                const msg = await uptimeLogs.send({ embeds: [embed] });
                botDB.uptime.log = msg.id;
                botDB.uptime.lastOfflineAt = Date.now();
                break;
            case "online":
            case "dnd":
            case "idle":
                const embed = makeEmbed("online");
                const msg = await uptimeLogs.messages.fetch(`${botDB.uptime.log}`);
                msg.edit({ embeds: [embed] }).catch(e => msg.channel.send({ embeds: [embed] }));
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