/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Embed } = require("../structures");
const { Permissions } = require("discord.js");
module.exports = {
    name: "messageCreate",
    once: false,
    async execute(client, message) {
        if (!client.initialized) return;
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#optional_chaining_operator
        if (!client.application?.owner) await client.application?.fetch();
        if (message.channel?.partial) await message.channel.fetch();
        if (message?.partial) await message.fetch();
        if (message.author.bot) return;
        const embed = new Embed();
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const prefixes = [escapeRegex(client.config.prefix.toLowerCase())];
        const prefixRegex = new RegExp(
            `^(<@!?${client.user.id}> |${prefixes.join("|")})\\s*`
        );
        let prefix = null;
        try {
            [, prefix] = message.content.toLowerCase().match(prefixRegex);
        } catch (e) {} //eslint-disable-line no-empty
        if (prefix) {
            const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command =
                client.commands.enabled.get(commandName) ||
                client.commands.enabled.find(
                    (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
                );
            if (!command || typeof command === "undefined") {
                if (client.debug && client.debugLevel > 0)
                    client.logger.log(`Can't find command: ${commandName}`);
                return;
            }
            if (command.disabled || !command.checkCooldown(message)) return;
            if (
                command.requirements?.ownerOnly &&
                !client.config.owners.includes(message.author.id)
            )
                return;
            if (command.requirements?.guildOnly && !message.guild)
                return message.channel.send(
                    "Uhhhh, this command can be used in servers only"
                );
            if (
                command?.botPerms &&
                message.channel.type !== "DM" &&
                message.guild
            ) {
                const botPerms = message.guild.me.permissionsIn(
                    message.channel
                );
                if (!botPerms) {
                    return message.reply("I don't have permission");
                }
                for (var i = 0; i < command.botPerms.length; i++) {
                    if (!botPerms.has(command.botPerms[i])) {
                        return message.reply(
                            `I don't have this permission: ${new Permissions(
                                command.botPerms[i]
                            )
                                .toArray()
                                .join("")
                                .toUpperCase()}`
                        );
                    }
                }
            }

            if (
                command?.memberPerms &&
                message.channel.type !== "DM" &&
                message.guild
            ) {
                const authorPerms = message.channel.permissionsFor(
                    message.author
                );
                if (!authorPerms) {
                    message.reply("You don't have permissions");
                    if (!client.config.ownerIds.includes(message.author.id))
                        return;
                }
                for (let i = 0; i < command.memberPerms.length; i++) {
                    if (!authorPerms.has(command.memberPerms[i])) {
                        message.reply(
                            `You don't have this permission: ${new Permissions(
                                command.memberPerms[i]
                            )
                                .toArray()
                                .join("")
                                .toUpperCase()}`
                        );
                        if (!client.config.ownerIds.includes(message.author.id))
                            return;
                    }
                }
            }

            if (command.requirements?.args && !args.length) {
                let reply = `Arguments are required for this command, use ${client.config.prefix}help ${command.name} for more info`;

                if (command.usage) {
                    reply += `\nUsage: \`${client.config.prefix}${command.name} ${command.usage}\``;
                }

                embed.addField(
                    `You didn't provide any arguments, ${message.author.tag}!`,
                    reply
                );
                return message.reply({ embeds: [embed] });
            }

            if (command.requirements?.subcommand && !args.length) {
                let reply = `Subcommands are required for this command.`;

                if (command.subcommands) {
                    const subcmds = [];
                    for (let i = 0; i < command.subcommands.length; i++) {
                        subcmds.push(command.subcommands[i].name);
                    }
                    reply += `\nThe subcommand(s) available are: \`${subcmds.join(
                        ", "
                    )}\``;
                }

                embed.setTitle("No subcommands provided");
                embed.addField(
                    `You didn't provide any subcommand, ${message.author.tag}!`,
                    reply
                );
                embed.addField(
                    "Want help?",
                    `Send \`${client.config.prefix}help ${command.name}\``
                );
                return message.reply({ embeds: [embed] });
            }

            if (command.subcommands && command.requirements?.subcommand) {
                const subcmds = [];
                for (let i = 0; i < command.subcommands.length; i++) {
                    subcmds.push(command.subcommands[i].name);
                }
                if (!subcmds.includes(args[0]))
                    return message.reply(
                        `Invalid subcommand, use ${client.config.prefix}help ${command.name} for more info`
                    );
            }
            if (
                command.requirements?.reviewerOnly &&
                client.config.roles.reviewer
            ) {
                const reply =
                    "You don't have the bot reviewer role to use this command";
                if (
                    typeof client.config.roles.reviewer === "string" &&
                    !message.member.roles.cache.has(
                        client.config.roles.reviewer
                    )
                ) {
                    return message.channel.send(reply);
                } else if (typeof client.config.roles.reviewer !== "string") {
                    const has = [];
                    message.member.roles.cache.forEach((r) => {
                        if (client.config.roles.reviewer.includes(r.id))
                            has.push(r.id);
                    });
                    if (!has || !has.length || !has[0])
                        return message.channel.send(reply);
                }
            }
            message.channel.sendTyping().catch(() => {});
            command.execute({ prefix, message, args });
        } else if (
            message.channel.id === client.config.channels?.findabot &&
            !message.reference
        ) {
            const msgDup = message.channel.messages.cache.get(message.id);
            msgDup.content = `${client.config.prefix}findabot ${message.content}`;
            client.emit("messageCreate", msgDup);
        }
        const mentionRegex = new RegExp(
            `^(<@!?${message.client.user.id}>)\\s*`
        );
        if (message.content.split(" ").length > 1) return;
        if (!mentionRegex.test(message.content)) return;
        const reply = `Hi there, ${message.author}\nI am ${client.user.username}\nMy prefix is "${client.config.prefix}"\nSend \`${client.config.prefix}help\` to get help`;
        embed
            .setTitle(`${client.user.tag}`)
            .setDescription(reply)
            .setThumbnail(client.user.displayAvatarURL());
        if (!message.reference) {
            message.channel.sendTyping().catch(() => {});
            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.messages
                .fetch(message.reference.messageId)
                .then((msg) => {
                    if (msg.author.id !== client.user.id) {
                        message.channel.sendTyping();
                        message.channel.send({ embeds: [embed] });
                    }
                })
                .catch(console.error);
        }
    },
};
