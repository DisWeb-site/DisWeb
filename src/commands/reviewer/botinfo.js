const { Command } = require("../../structures");
const botModel = require('../../db/models/Bot');
const { MessageEmbed } = require('discord.js');

module.exports = class CMD extends Command {
  constructor(client) {
    super(
      {
        name: "botinfo",
        description: "See information of a specific bot.",
        aliases: ["bi"],
        disabled: false,
        category: "Core"
      },
      client
    );
  }

  async execute({ message }) {
      const prefix = "=";
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const Bot = message.mentions.users.first() || client.users.fetch(args[0]);
      if (!Bot) return message.channel.send(`Please mention a bot or the bot's ID to view information of it.`);
      const bot = await botModel.findOne({ botId: Bot.id });
      const botinfo = new MessageEmbed();
      botinfo.setColor(`BLUE`);
      botinfo.addField(`Name`, Bot.username, true);
      botinfo.addField(`ID`, Bot.id, true);
      botinfo.addField(`Approved`, bot.approved ? "True" : "False", true);
      botinfo.addField(`Prefix`, bot.prefix, true);
      botinfo.addField(`About`, bot.descriptions.short, true)
      botinfo.addField(`Statistics`, `
**Server count**: ${bot.stats.serverCount} servers`, true);
      botinfo.addField(`Analytics`, `
**Views**: ${bot.analytics.views}
**Votes**: ${bot.analytics.votes}
**Invites**: ${bot.analytics.invites}`, true);
      botinfo.addField(`Links`, `
**Website**: ${bot.website || "None"}
**Support Server**: ${bot.support || "None"}
**GitHub**: ${bot.github || "None"}`, true)
      botinfo.addField(`Owner`, `<@${bot.owner}>`, true);
      message.channel.send(botinfo);
    }
} 
