//eslint-disable-next-line no-unused-vars
const { Command } = require("../../structures");
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

        const embed = new MessageEmbed()
            .setAuthor(`DisList Queue`)
            .setDescription(`There are currently **${queue.length}** bot(s) awaiting approval.`)
            .setColor(`BLURPLE`);
        message.channel.send({ embeds: [embed] });
    }
};
