/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */

//eslint-disable-next-line no-unused-vars
const { Command } = require("../../structures");
const { Client, MessageEmbed } = require('discord.js');
const moment = require("moment");
require("moment-duration-format");

module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "vote",
                description: "Vote for a bot using mention or ID",
                aliases: ["v"],
                disabled: false,
                category: "Core",
                usage: "[@mention / bot ID]"
            },
            client
        );
    }
    async execute({ message, args }) {

        const bot = this.client.util.userFromMentionOrId(args[0]);
        if (!bot) return message.reply("Please mention a bot, or input it's ID to vote for it.");
        if (!bot.bot) return message.reply("That is not a bot.");

        const botDB = await this.client.db.findBot(bot.id);
        if (!botDB) return message.reply("That bot is not added to DisWeb, or has been rejected.");

        const { config } = this.client;
        const voteLogs = await this.client.channels.fetch(config.channels.voteLogs);

        let vote;

        try {
            vote = await client.models.Vote.find({ botId: bot.id, userId: message.author.id })
            .then((votes) => votes)
            .catch((e) => {
                throw e;
            });
        } catch (e) {
            if (client.debugLevel > 1) console.log(e);
        }
        vote = vote.at(-1);
        if (vote) {
            const diff = 12 * 60 * 60 * 1000 - (new Date().getTime() - vote.votedAt);
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
                return message.reply(`You have already voted for this bot, Try again in ${duration}`);
            }
        } else if (client.debug) {
            client.logger.debug(
                `There was no vote found in db for ${req.user.tag} (${req.user.id}), so I guess this user didn't vote in last 12 hours`
            );
        }
        vote = new client.models.Vote({ botId: bot.id, userId: message.author.id, votedAt: new Date().getTime() });
        await vote.save();

        botDB.analytics.votes = botDB.analytics.votes + 1;
        await botDB.save();

        let voteLogs;
        try {
            voteLogs = await this.client.channels.fetch(this.client.config.channels.voteLogs);
        } catch (e) {}

        const embed = new MessageEmbed()
        .setTitle(`${req.user.tag} voted for ${bot.tag}`)
        .setDescription(`${bot} (${bot.id})`);
        if (voteLogs) voteLogs.send({ embeds: [embed] });
        else client.logger.error("Can't get channels.voteLogs");

        return message.reply(`Successfully voted for bot!`)
    }
};
