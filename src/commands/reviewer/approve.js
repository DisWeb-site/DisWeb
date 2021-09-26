/**
 * DisList
 * Copyright (c) 2021 The DisList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "approve",
                description: "Approve a bot",
                requirements: {
                    guildOnly: true,
                    reviewerOnly: true,
                },
                usage: "[@mention/bot id] (comment)",
                aliases: ["accept"],
                disabled: false,
                category: "Bot Reviewer",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { config, models } = this.client;
        const botModel = models.Bot;
        const bot = await this.client.util.userFromMentionOrId(args[0]);
        if (!bot) return message.reply("Please mention a bot to approve!");
        if (!bot.bot) return message.reply("That is not a real bot!");
        const comment = args.slice(1).join(" "); //optional
        const data = await botModel.findOne({ botId: bot.id });
        if (!data)
            return message.channel.send(
                "That bot is not added or is rejected!"
            );
        if (data.approved)
            return message.channel.send(
                "That bot is already approved by someone!"
            );
        const botMember = await this.client.guilds.cache
            .get(config.servers.main.id)
            .members.fetch(bot.id);
        if (!botMember)
            return message.channel.send(
                "This bot is not added to DisList server, please add it then use this command again"
            );
        const approving = await message.channel.send(
            "Please wait, approving the bot..."
        );
        data.approved = true;
        await data.save();
        const botLogs = await this.client.channels.fetch(
            config.channels.botLogs
        );
        const embed = new MessageEmbed()
            .setTitle(`Bot Approved ${config.emojis.approved}`)
            .setDescription(`${bot} is aprroved! :tada:`)
            .addField("Reviewer", `${message.author} (${message.author.id})`);
        botLogs.send({
            content: `<@${data.owner}>`,
            embeds: [embed],
        });
        approving.edit(
            `:white_check_mark: Success! **${bot.tag}** has been approved!`
        );
    }
};
