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
        let rate = botDB.uptime?.rate ?? 99;
        const uptimeLogs = await client.channels.fetch(client.config.channels.uptimeLogs);
        const makeEmbed = () => {
            const embed = new MessageEmbed()
                .addField("**Uptime Rate**", rate);
            return embed;
        }
        switch(newPresence.status) {
            case "offline":
                const embed = makeEmbed();
                const msg = await uptimeLogs.send({ embeds: [embed] });
                botDB.uptime.log = msg.id;
                break;
        }
    },
};