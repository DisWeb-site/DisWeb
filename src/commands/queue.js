const Discord = require('discord.js')

module.exports = {
  name: "queue",
  description: "View the DISLIST BOTS queue",
  aliases: ["q"],
  run: async (client, message, args) => {
  const queue = await client.getQueue();
  
  const q = new Discord.MessageEmbed();
  q.setAuthor(`Dislist bots Queue`, )
  q.setDescription(`
There are currently **${queue.length}** bot(s) awaiting approval.

${queue.bot || "No bots are currently awaiting approval"}`);
  q.setColor(`BLURPLE`);
  message.channel.send(q);
}
}
