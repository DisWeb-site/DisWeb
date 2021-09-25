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
            .setAuthor(`DisList Queue`)
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
                .setURL(`${this.client.config.site.url}/bot/${bot.id}`);
        });
        const pagination = new Pagination(this.client);
        pagination.setPages(pages);
        pagination.setAuthorizedUsers([message.author.id]);
        pagination.send(message.channel);
    }
};
