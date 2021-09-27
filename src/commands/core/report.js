const { Command } = require("../../structures");
const { MessageEmbed } = require('discord.js');

module.exports = class CMD extends Command {
  constructor(client) {
    super(
      {
        name: "report",
        description: "Report issues.",
        disabled: false,
        category: "Core"
      },
      client
    );
  }

  async execute({ message }) {
      const prefix = "=";
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const report = args.join(" ");
      if (!report) return message.channel.send(`Please give some feedback to send the report.`)
      if (report < 10) 
        message.channel.send(`Your report must have at least **10** characters.`);
      const UpList = client.guilds.cache.get('PUT GUILD ID HERE');
      const UpListReportChannel = UpList.channels.cache.get('PUT REPORT CHANNEL ID HERE');
      
      if (UpListReportChannel) {
        const report = new MessageEmbed();
        report.setAuthor(`Report`);
        report.setDescription(`**From**: ${message.author.tag}
**Report**: \`${report}\``);
        report.setFooter(`Reported by ${message.author.tag}`);
        UpListReportChannel.send(report);
        if (reason) {
          message.channel.send(`:white_check_mark: Your report has been submitted.`)
        }
      }
    }
}
