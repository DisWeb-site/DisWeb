/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
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
                category: "Bot reviewer",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { config, models, servers } = this.client;
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
        if (data.owner === message.author.id)
            return message.reply(
                "Oh no... Bot owners can't approve their own bots."
            );
        if (data.approved)
            return message.channel.send(
                "That bot is already approved by someone!"
            );
        let botMember, botMember2, ownerMember;
        try {
            botMember = await servers.main.members.fetch(bot.id);
            botMember2 = await servers.test.members.fetch(bot.id);
            ownerMember = await servers.main.members.fetch(data.owner);
        } catch (e) {
            if (this.client.debug) console.log(e);
        }
        if (!botMember)
            return message.channel.send(
                `This bot is not added to DisWeb server, please add it: https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot%20applications.commands&permissions=0`
            );
        if (!botMember2)
            return message.channel.send(
                "Uhhhhhh. Hey, did you test the bot, it does not even exist in the test server!"
            );
        const diff =
            Number(config.minimumDays) * 24 * 60 * 60 * 1000 -
            (new Date().getTime() - data.addedAt);

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
            return message.reply(
                `Woah, not even ${config.minimumDays} day(s) over after adding the bot. Please try after ${duration}!`
            );
        }
        const approving = await message.channel.send(
            "Please wait, approving the bot..."
        );
        data.approved = true;
        data.approvedAt = Date.now();
        await data.save();
        const botLogs = await this.client.channels.fetch(
            config.channels.botLogs
        );
        const embed = new MessageEmbed()
            .setTitle(`Bot Approved ${config.emojis.approved}`)
            .setDescription(`${bot} is approved! :tada:`)
            .addField("Reviewer", `${message.author} (${message.author.id})`);
        if (comment) embed.addField("Comment", comment);
        const reply = {
            content: `<@${data.owner}>`,
            embeds: [embed],
            files: [...message.attachments.values()] ?? [],
        };
        botLogs.send(reply);
        const owner = (await this.client.users.fetch(data.owner)) ?? null;
        if (owner) owner.send(reply);
        if (botMember2 && botMember2.kickable) botMember2.kick();
        if (ownerMember) ownerMember.roles.add(config.roles.developer);
        approving.edit(
            `:white_check_mark: Success! **${bot.tag}** has been approved!`
        );
    }
};
