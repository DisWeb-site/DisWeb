/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */
const moment = require("moment");
require("moment-duration-format");
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "uptime",
                description: "Get uptime of the bot",
                aliases: [],
                usage: "(@mention/bot id)",
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    execute({ message, args }) {
        let embed;
        const date = new Date();
        if (args[0]) {
            const bot = await this.client.util.userFromMentionOrId(args[0]);
            if (!bot) return;
            const botDB = await this.client.models.Bot.findOne({ botId: bot.id });
            if (!botDB) return message.channel.send("Sorry bot is not found in the db");
            const online = bot.presence?.status === "online";
            const duration = moment
            .duration(botDB.uptime[online ? "lastOnlineFrom" : "lastOfflineAt"])
            .format(" D [days], H [hours], m [minutes], s [seconds]");
            embed = new MessageEmbed()
                .setAuthor(bot.tag, bot.displayAvatarURL())
                .setTitle(`_**${bot.tag}**_`)
                .addField("**Uptime Rate**", `${botDB.uptime.rate}%`)
                .addField(`**${online ? "Online" : "Offline"} from**`, `\`\`\`${duration}\`\`\``);
            return message.channel.send({ embeds: [embed] });
        }
        const duration = moment
            .duration(message.client.uptime)
            .format(" D [days], H [hours], m [minutes], s [seconds]");
        const timestamp = date.getTime() - Math.floor(message.client.uptime);
        embed = new MessageEmbed()
            .setTitle(":hourglass_flowing_sand:")
            .addField("Uptime", `\`\`\`${duration}\`\`\``)
            .addField(
                "Date launched",
                `\`\`\`${moment(timestamp).format("LLLL")}\`\`\``
            )
            .setColor("GREEN")
            .setTimestamp();
        message.channel.send({
            embeds: [embed],
        });
    }
};
