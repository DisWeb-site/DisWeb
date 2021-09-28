/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
//eslint-disable-next-line no-unused-vars
const { Command } = require("../../structures");
const { Pagination } = require("djs-pagination-buttons");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "queue",
                description: "Get current queue",
                aliases: ["qu"],
                disabled: false,
                category: "Bot reviewer",
            },
            client
        );
    }

    async execute({ message }) {
        const queue = await this.client.models.Bot.find({ approved: false });
        const pages = [new MessageEmbed()];

        pages[0]
            .setColor(`BLURPLE`)
            .setAuthor(`DisWeb Queue`)
            .setDescription(
                `There are currently **${queue.length}** bot(s) awaiting approval.\nGo to the next page to start the list of bots`
            );
        queue.forEach(async (botDB) => {
            const bot = await this.client.users.fetch(botDB.botId);
            const p = pages.length;
            pages[p] = new MessageEmbed()
                .setColor(`BLURPLE`)
                .setTitle(`${bot.username}`)
                .setDescription(botDB.descriptions.short)
                .setURL(`${this.client.config.site.url}/bot/${bot.id}`)
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
                );
        });
        const pagination = new Pagination(this.client);
        pagination.setPages(pages);
        pagination.setAuthorizedUsers([message.author.id]);
        pagination.send(message.channel);
    }
};
