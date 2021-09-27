/**
 * UpList
 * Copyright (c) 2021 The UpList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "reject",
                description: "Reject a bot",
                requirements: {
                    guildOnly: true,
                    reviewerOnly: true,
                },
                usage: "[@mention/bot id] [reason]",
                aliases: ["decline", "deny"],
                disabled: false,
                category: "Bot reviewer",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { config, models } = this.client;
        const botModel = models.Bot;
        const bot = await this.client.util.userFromMentionOrId(args[0]);
        if (!bot)
            return message.channel.send("Please mention a bot to reject!");
        if (!bot.bot) return message.channel.send("That is not a real bot!");
        const reason = args.slice(1).join(" ");
        if (!reason)
            return message.channel.send(
                "Please provide a reason to reject this bot!"
            );
        const data = await botModel.findOne({ botId: bot.id });
        if (!data)
            return message.channel.send(
                "That bot is not added or is rejected!"
            );
        //if (data.owner === message.author.id) return message.reply("Oh no... Bot owners can't reject their own bots.");
        if (data.approved)
            return message.channel.send(`This bot is already approved!`);
        //let botMember, botMember2;
        let botMember2;
        try {
            /*botMember = await this.client.guilds.cache
                .get(config.servers.main.id)
                .members.fetch(bot.id);*/ //not required
            botMember2 = await this.client.guilds.cache
                .get(config.servers.test.id)
                .members.fetch(bot.id);
        } catch (e) {
            if (this.client.debug) console.log(e);
        }
        const rejecting = await message.channel.send(
            `Please wait, rejecting bot...`
        );
        await botModel.findOneAndDelete({ botId: bot.id });
        const botLogs = await this.client.channels.fetch(
            config.channels.botLogs
        );
        const embed = new MessageEmbed()
            .setTitle(`Bot Rejected ${config.emojis.rejected}`)
            .setDescription(`${bot} is rejected! :x:`)
            .addField("Reviewer", `${message.author} (${message.author.id})`)
            .addField("Reason", `${reason}`);
        const reply = {
            content: `<@${data.owner}>`,
            embeds: [embed],
            attachments: [...message.attachments.values()] ?? [],
        };
        botLogs.send(reply);
        const owner = (await this.client.users.fetch(data.owner)) ?? null;
        if (owner) owner.send(reply);
        if (botMember2) botMember2.kick();
        rejecting.edit(
            `:white_check_mark: Success! ${bot.tag} has been rejected!`
        );
    }
};
