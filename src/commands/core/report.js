/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "report",
                description: "Report issues.",
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { config } = this.client;
        const report = args.join(" ");
        if (!report)
            return message.channel.send(
                "Please give some feedback to send the report."
            );
        /*if (report.length < 5)
            message.channel.send(
                "Your report must have at least **5** characters."
            );*/
        const reportLogs = await this.client.channels.fetch(
            config.channels.reportLogs
        );

        const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setTitle("New report 🐛")
            .setDescription(report)
            .addField(
                "**From guild:**",
                `${message.guild.name} (${message.guild.id})`
            )
            .addField(
                "**Reporter:**",
                `<@${message.author.id}> (${message.author.id})`
            )
            .setFooter(`${message.author.tag} made a new report!`);
        reportLogs.send({ embeds: [embed] });
        message.channel.send(
            ":white_check_mark: Your report has been submitted."
        );
    }
};
