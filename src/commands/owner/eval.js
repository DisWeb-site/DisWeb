/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisList
 */
/*eslint-disable no-unused-vars*/
const { Command } = require("../../structures");
const { MessageEmbed } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "eval",
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

    execute({ message, args }) {
        const { inspect } = require("util");
        const { client } = this;
        const content = args.join(" ");
        const embed = new MessageEmbed().addField(
            "**Input**",
            "```js\n" + content + "\n```"
        );
        const result = new Promise((resolve) => resolve(eval(content)));
        if (!message || !message.channel) return;
        const clean = (text) => {
            if (typeof text === "string") {
                if (text.includes(message.client.token)) {
                    //Client token
                    text = text.replace(message.client.token, "T0K3N");
                }
                if (
                    message.client.config.site.secret &&
                    text.includes(message.client.config.site.secret)
                ) {
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

        return result
            .then((output) => {
                const type = typeof output;
                if (typeof output !== "string") {
                    output = inspect(output, { depth: 0 }); //depth should be 0 as it will give contents of object in a property, in this object. That makes the message too long.
                }

                message.reply({
                    embeds: [
                        embed
                            .setDescription("```js\n" + clean(output) + "\n```")
                            .addField("**Type**", type),
                    ],
                });
            })
            .catch((err) => {
                if (typeof err !== "string") {
                    err = inspect(err, { depth: 0 });
                }

                message.reply({
                    embeds: [
                        embed.setDescription(
                            "ERROR:\n```js\n" + clean(err) + "\n```"
                        ),
                    ],
                });
            });
    }

    async giveCredits(userId, amount, message) {
        const userDB = await this.client.db
            .findOrCreateUser(userId)
            .catch(() => {});
        userDB.wallet = parseInt(userDB.wallet) + amount;
        userDB.markModified("wallet");
        await userDB.save();
        message.reply("Done");
    }
};
