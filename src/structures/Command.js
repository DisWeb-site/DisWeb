/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */
const { Collection } = require("discord.js");
module.exports = class Command {
    constructor(opts, client) {
        this.client = client;
        const { createOptionHandler } = client.util;
        const options = createOptionHandler("Command", opts);
        this.name = options.required("name");
        this.description = options.optional("description", "Not provided");
        this.aliases = options.optional("aliases", null);
        this.requirements = options.optional("requirements", {
            args: false,
            subcommand: false,
            guildOnly: false,
            ownerOnly: false,
            reviewerOnly: false,
        });
        this.usage = options.optional("usage", null);
        this.disabled = options.optional("disabled", false);
        this.category = options.optional("category", "General");
        this.cooldown = options.optional("cooldown", 5);
        if (this.name.includes("-")) {
            this.aliases.push(this.name.replace(/-/g, ""));
        }
        if (this.aliases) {
            for (let i = 0; i < this.aliases.length; i++) {
                const alias = this.aliases[i];
                if (alias.includes("-")) {
                    const alias2 = alias.replace(/-/g, "");
                    if (this.name !== alias2) this.aliases.push(alias2);
                }
            }
        }
    }

    checkCooldown(message) {
        const { author } = message;
        const { cooldowns } = this.client.commands;

        if (!cooldowns.has(this.name)) {
            cooldowns.set(this.name, new Collection());
        }

        const now = Date.now(); //number of milliseconds elapsed since January 1, 1970 00:00:00 UTC. Example: 1625731103509
        const timestamps = cooldowns.get(this.name);
        const cooldownAmount = (this.cooldown || 5) * 1000;

        if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id) + cooldownAmount;

            if (now < expirationTime) {
                //Still this cooldown didn't expire.
                const timeLeft = (expirationTime - now) / 1000;
                message.channel.send(
                    `Woah, slowdown buddy. Wait for ${timeLeft.toFixed()} seconds before using the ${
                        this.name
                    } command again`
                );
                return false;
            }
        }

        return this.applyCooldown(author, cooldownAmount);
    }

    applyCooldown(author, cooldownAmount) {
        const timestamps = this.client.commands.cooldowns.get(this.name);
        timestamps.set(author.id, Date.now());
        setTimeout(() => timestamps.delete(author.id), cooldownAmount); //Delete cooldown for author after cooldownAmount is over.
        return true;
    }

    removeCooldown(author) {
        const timestamps = this.client.commands.cooldowns.get(this.name);
        timestamps.delete(author.id);
        return true;
    }
};
