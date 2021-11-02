/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Embed, Command } = require("../../structures");
const { Util } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "findabot",
                description: "Search for bots.",
                usage: "[search term]",
                aliases: ["fab"],
                disabled: false,
                category: "Core",
                cooldown: 10,
            },
            client
        );
    }

    async execute({ message, args }) {
        const embed = new Embed();
        let results = await this.client.util.findabot(
            Util.cleanContent(args.join(" ")).replace(/@/gi, "")
        );
        let text = "";
        if (results) {
            results = results.slice(0, 20);
            results.forEach((result) => {
                text += `${results.indexOf(result) + 1}. [${result.bot.tag}](${
                    this.client.config.site.url
                }/bot/${result.bot.id}) - ${
                    result.botDB.descriptions.short.slice(0, 40) + "..."
                }\n`;
            });
        }
        embed
            .setTitle("Search Results")
            .setDescription(!results ? "No results" : text);
        message.channel.send({ embeds: [embed] });
    }
};
