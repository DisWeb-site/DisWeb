/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisList
 */
const { Command } = require("../../structures");
const { Pagination } = require("djs-pagination-buttons");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "help",
                description: "Show's all commands",
                aliases: ["commands", "cmds", "ajuda"], //ajuda means help in portuguese
                requirements: {
                    args: false,
                },
                usage: "(category / command name)",
                disabled: false,
                cooldown: 10,
                category: "Core",
            },
            client
        );
    }

    async execute({ message, args }) {
        const { client } = this;
        const commands = client.commands.enabled;
        const { categories } = client;
        const pages = [new MessageEmbed()];
        const timeout = 200000; //20 secs timeout
        for (let i = 0; i < pages.length; i++) {
            pages[i].setTitle("DisList help");
        }
        if (!args.length) {
            categories.forEach((cat) => {
                const p = pages.length;
                const commandsCat = [];
                pages[p] = new MessageEmbed().setTitle(
                    `DisList help - ${cat.name} Category`
                );
                commands.forEach((command) => {
                    if (command.category === cat.name)
                        commandsCat.push(
                            `• ${command.name} - ${command.description}`
                        );
                });
                pages[p].addField(
                    `${cat.emoji} Commands in this category`,
                    `\`\`\`\n${commandsCat.join("\n")}\n\`\`\``
                );
            });
            pages[0].setDescription("All commands");
            pages[0].addField("No. of Commands", `${commands.size}`);
            pages[0].addField("No. of categories", `${categories.length}`);
            pages[0].addField(
                "Get help for specific command:",
                `Send \`${client.config.prefix}help (command name)\` to get info on a specific command!`
            );
            const pagination = new Pagination(this.client, {
                buttons: {
                    page: `Page {{page}} / {{total_pages}}`,
                },
                timeout: timeout,
            });
            pagination.setPages(pages);
            pagination.setAuthorizedUsers([message.author.id]);
            pagination.send(message.channel);
            return;
        } else if (args[0] && args[0] === "--list-categories") {
            const cats = [];
            categories.forEach((cat) => {
                cats.push(`${cat.name}`);
            });
            return message.reply({
                embeds: [
                    pages[0].setDescription(
                        `All categories\n\`\`\`\n• ${cats.join("\n• ")}\n\`\`\``
                    ),
                ],
            });
        }

        const name = args[0].toLowerCase();
        const alias = commands.find(
            (c) => c.aliases && c.aliases.includes(name)
        );
        const command = commands.get(name) || alias;
        const category = categories.find(
            (c) => c.name.toLowerCase() === `${args.join(" ").toLowerCase()}`
        );

        if (!command && !category) {
            return message.channel.send(
                `Could not find the command / category, ${message.author}`
            );
        }

        if (command) {
            pages[0].setDescription(`Help for ${command.name} command`);
            pages[0].addField("Command name", command.name);
            pages[0].addField("Description", command.description);
            if (command.aliases && command.aliases?.length)
                pages[0].addField("Aliases: ", command.aliases.join(", "));
            if (command.usage)
                pages[0].addField(
                    "Usage",
                    `\`\`\`\n${client.config.prefix}${command.name} ${command.usage}\n\`\`\`` +
                        `\n**Usage Key!**\nThe [ and ] around the argument mean it’s required.\nThe ( and ) around the argument mean it’s optional.`
                );

            /*pages[0].addField(
                "Cooldown:",
                `${command.cooldown || 3} second(s)`
            );*/
        } else if (category) {
            const commandsInCat = [];
            commands.each((cmd) => {
                if (cmd.category.toLowerCase() === category.name.toLowerCase())
                    commandsInCat.push(`${cmd.name} - ${cmd.description}`);
            });
            pages[0].addField(
                "Commands in this category",
                `\`\`\`\n• ${commandsInCat.join("\n• ")}\n\`\`\``
            );
        }

        message.channel.send({ embeds: [pages[0]] });
    }
};
