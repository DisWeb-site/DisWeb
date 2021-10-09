 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */
//eslint-disable-next-line no-unused-vars
const { Command } = require("../../structures");
const { MessageEmbed } = require('discord.js');

module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "suggest",
                description: "Send us suggestions to improve DisWeb!",
                aliases: ["suggestion", "add-suggest", "add-suggestion"],
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    execute({ message, args }) {
        const suggestion = args.join(" ");
        if (!suggestion) return message.channel.send(`Please include your suggestion to submit it.`);

        const { config } = this.client;
        const suggestionLog = await this.client.channels.fetch(
            config.channels.suggestionLog
        );

        const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTitle(`New suggestion`)
        .setDescription(suggestion)
        .addField(`
        **From guild:**`, 
        `${message.guild.name} (${message.guild.id})`
        )
        .addField(
            `**Submitted By**`, 
            `<@${message.author.id}> (${message.author.id})`
        )
        .setFooter(`${message.author.tag} made a new suggestion!`);
        suggestionLog.send({ embeds: [embed] });
        message.channel.send(
            `:white_check_mark: Your suggestion has been submitted!
Thanks!`
        );
    }
};
