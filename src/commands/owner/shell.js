/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisList
 */
/*eslint-disable no-unused-vars*/
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
const { inspect } = require("util");
const child = require("child_process");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "shell",
                aliases: ["exec", "terminal"],
                requirements: {
                    args: true,
                    ownerOnly: true,
                },
                disabled: false,
                cooldown: 10,
                category: "Owner Only",
            },
            client
        );
    }

    //eslint-disable-next-line no-unused-vars
    execute({ message, args }) {
        const command = args.join(" ");
        const embed = new MessageEmbed().addField(
            "**Input**",
            "```js\n" + command + "\n```"
        );
        const clean = (text) => {
            if (typeof text === "string") {
                if (text.includes(message.client.token)) {
                    //Client token
                    text = text.replace(message.client.token, "T0K3N");
                }
                if (text.includes(message.client.config.site.secret)) {
                    //Client secret
                    text = text.replace(
                        message.client.config.site.secret,
                        "SECR3T"
                    );
                }
                return text
                    .replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            }
        };
        child.exec(command, (err, res) => {
            if (err) {
                if (typeof err !== "string") {
                    err = inspect(err, { depth: 0 });
                }
                return message.reply({
                    embeds: [
                        embed.setDescription(
                            "ERROR:\n```js\n" + clean(err) + "\n```"
                        ),
                    ],
                });
            }
            const type = typeof res;
            if (typeof res !== "string") {
                res = inspect(res, { depth: 0 }); //depth should be 0 as it will give contents of object in a property, in this object. That makes the message too long.
            }

            message.reply({
                embeds: [
                    embed
                        .setDescription("```js\n" + clean(res) + "\n```")
                        .addField("**Type**", type),
                ],
            });
        });
    }
};
