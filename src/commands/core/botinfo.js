/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "botinfo",
                description: "See information of a specific bot.",
                usage: "[@mention / bot id]",
                aliases: ["bi"],
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    async execute({ message, args }) {
        const bot = await this.client.util.userFromMentionOrId(args[0]);
        if (!bot)
            return message.reply("Please mention a bot to get it's info!");
        if (!bot.bot) return message.reply("That is not a real bot!");
        const botDB = await this.client.db.findBot(bot.id);
        if (!botDB)
            return message.channel.send(
                "That bot is not added or is rejected!"
            );
        const embed = new MessageEmbed()
            .setColor("#7289da")
            .addField("Name", bot.username, true)
            .addField("ID", bot.id, true)
            .addField(
                "Status",
                botDB.approved ? "Approved" : "Not approved",
                true
            )
            .addField("Prefix", botDB.prefix, true)
            .addField("About", botDB.descriptions.short, true)
            .addField(
                "Statistics",
                `**${botDB.stats?.shardCount ? "Shard" : "Server"} count:** ${
                    botDB.stats?.shardCount ?? botDB.stats.serverCount
                }\n**Votes:** ${botDB.analytics.votes}`,
                true
            )
            .addField(
                "Links",
                `[Invite](https://discord.com/oauth2/authorize?client_id=${
                    bot.id
                }&scope=bot%20applications.commands&permissions=0) ${
                    botDB.website ? `| [Website](${botDB.website})` : ""
                } ${botDB.support ? `| [Support](${botDB.support})` : ""} ${
                    botDB.github ? `| [GitHub](${botDB.github})` : ""
                }`,
                true
            )
            .addField("Owner", `<@${botDB.owner}>`, true)
            .setURL(`${this.client.config.site.url}/bot/${bot.id}`);
        message.channel.send({ embeds: [embed] });
    }
};
