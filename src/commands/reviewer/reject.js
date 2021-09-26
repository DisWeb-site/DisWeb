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
                aliases: ["decline", "deny"],
                disabled: false,
                category: "Bot Reviewer",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { config, models } = this.client;
        const botModel = models.Bot;
        const bot = this.client.util.userFromMentionOrId(args[0]);
        if (!bot)
            return message.channel.send(`Please mention a bot to reject!`);
        if (!bot.bot) return message.channel.send("That is not a real bot!");
        const reason = args.slice(1).join(" ");
        if (!reason)
            return message.channel.send(
                `Please provide a reason to reject this bot!`
            );
        const data = await botModel.findOne({ botId: bot.id });
        if (!data)
            return message.channel.send(
                `That bot is not added or is rejected!`
            );
        if (data.approved === true)
            return message.channel.send(`This bot is already approved!`);

        const rejecting = await message.channel.send(
            `Please wait, rejecting bot...`
        );
        await botModel.findOneAndDelete({ botId: bot.id });
        const botLogs = await this.client.channels.fetch(
            config.channels.botLogs
        );
        const embed = new MessageEmbed()
            .setTitle(`Bot Rejected ${config.emojis.approved}`)
            .setDescription(`${bot} is rejected! :tada:`)
            .addField("Reviewer", `${message.author} (${message.author.id})`);
        botLogs.send({
            content: `<@${data.owner}>`,
            embeds: [embed],
        });

        rejecting.edit(
            `:white_check_mark: Success! ${bot.tag} has been rejected!`
        );
    }
};
