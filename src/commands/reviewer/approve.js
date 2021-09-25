const { Command } = require("../../structures");

const botModel = require('../../db/models/Bot')
module.exports = class CMD extends Command {
  constructor(client) {
    super(
      {
        name: "approve",
        description: "Approve a bot",
        aliases: ["accept"],
        disabled: false,
        category: "Core"
      },
      client
    );
  }

  async execute({ message }) {
    const mentionedBot = message.mentions.users.first();
    if (!mentionedBot) return message.reply(`Please mention a bot to approve!`)
    if (!mentionedBot.bot) return message.reply(`That is not a real bot!`)
    await botModel.findOne({ botId: mentionedBot.id }, async (err, data) => {
    if (!data) return message.channel.send(`That bot is not added on DisList!`);
    if (data.approved === true) return message.channel.send(`That bot is already approved!`)    

    const approving = await message.channel.send('Please wait, approving the bot...');
    
    if (data) {
      data.approved = true;
      await data.save();
    }
    
    const disListGuild = client.guilds.cache.get('887493135649894440');
    const disListBotLogs = disListGuild.channels.cache.get('put bot log channel id here');
    disListBotLogs.send(`**${mentionedBot.tag}** was approved by ${message.author}`);
    

    approving.edit(`:white_check_mark: Success! ${mentionedBot.tag} has been approved!`)
        });
    }
