const { Command } = require("../../structures");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "reject",
                description: "Reject a bot",
                aliases: ["decline"],
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    async execute({ message, args }) {
        const botModel = this.client.models.Bot;
        const mentionedBot = message.mentions.users.first();
        if (!mentionedBot)
            return message.channel.send(`Please mention a bot to reject!`);
        if (!mentionedBot.bot)
            return message.channel.send("That is not a real bot!");
        const reason = args.slice(1).join(" ");
        if (!reason)
            return message.channel.send(
                `Please provide a reason to reject this bot!`
            );
        await botModel.findOne(
            { botId: mentionedBot.id },
            async (err, data) => {
                if (!data)
                    return message.channel.send(
                        `That bot does not exist in DisList!`
                    );
                if (data.approved === true)
                    return message.channel.send(
                        `This bot is already approved!`
                    );

                const rejecting = await message.channel.send(
                    `Please wait, rejecting bot...`
                );

                if (data) {
                    await botModel.findOneAndDelete({ botId: mentionedBot.id });
                }

                const disListGuild =
                    client.guilds.cache.get("887493135649894440");
                const disListBotLogs = disListGuild.channels.cache.get(
                    "put bot log channel id here"
                );
                disListBotLogs.send(`**${mentionedBot.tag}** was declined by ${message.author}
Reason: ${reason}`);

                approving.edit(
                    `:white_check_mark: Success! ${mentionedBot.tag} has been rejected!`
                );
            }
        );
    }
};
