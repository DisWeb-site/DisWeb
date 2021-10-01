/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
//const { Permissions } = require("discord.js");
const axios = require("axios");
class Util {
    constructor(client) {
        this.client = client ?? null;
    }

    genToken() {
        let token = "";
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwzy0123456789.-_";
        for (let i = 0; i < 32; i++) {
            token += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        return token;
    }

    createOptionHandler(className, opts) {
        if (typeof opts === "undefined") {
            throw new Error(
                "createOptionHandler: expected opts arg to not be undefined, but received undefined"
            );
        }
        return {
            optional: (key, defaultVal) => {
                const val = opts?.[key];
                if (typeof val === "undefined") {
                    return defaultVal;
                }
                return opts[key];
            },

            required: (key) => {
                if (typeof opts?.[key] === "undefined") {
                    throw new Error(
                        `${key} key in opts of ${className} class is required.`
                    );
                } else {
                    return opts[key];
                }
            },
        };
    }

    async fetchUser(userData, client) {
        //const { client } = this;
        /*if (userData.guilds) {
            for (let i = 0; i < userData.guilds.length; i++) {
                //let guild = userData.guilds[i];
                const guild = userData.guilds[i];
                const perms = new Permissions(BigInt(guild.permissions));
                let admin = false;
                if (perms.has(Permissions.FLAGS.MANAGE_GUILD) || guild.owner) {
                    admin = true;
                }
                /*let djsGuild = null;
                try {
                    djsGuild = await client.guilds.fetch(guild.id);
                } catch(e) {}
                if (djsGuild && djsGuild.id) {
                    guild = djsGuild;
                    guild.botInvited = true;
                } else {
                    guild.botInvited = false;
                }*/ /*
                guild.admin = admin;
                guild.manageUrl = `/manage/${guild.id}`;
                guild.iconURL = guild.icon
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                    : "https://emoji.gg/assets/emoji/discord.png";
                userData.guilds[i] = guild;
            }
            userData.displayedGuilds = userData.guilds.filter((g) => g.admin);
        }*/
        client.db.findOrCreateUser(userData.id);
        const user = await client.users.fetch(userData.id);
        return { user, userData };
    }

    CheckAuth(req, res, next) {
        if (req.client.debug) console.log("Checking auth");
        if (!req.user || !req.session.user) {
            const redirectUrl =
                req.originalUrl.includes("login") || req.originalUrl === "/"
                    ? "/"
                    : req.originalUrl;
            const state = Math.random().toString(36).substring(5);
            req.client.site.states[state] = redirectUrl;
            return res.redirect(
                `/discord/login?state=${encodeURIComponent(state)}`
            );
        }
        return next();
    }

    async presence() {
        const { client } = this;
        const bots = await client.models.Bot.countDocuments({});
        //const users = await client.models.User.countDocuments({});
        const presences = [
            {
                name: `${bots} bot${bots > 1 ? "s" : ""} | ${
                    client.config.prefix
                }help`,
                type: "WATCHING",
            },
            {
                name: `${client.user.username} | ${client.config.prefix}help`,
                type: "PLAYING",
            },
        ];
        client.user.setPresence({
            activities: [
                presences[Math.floor(Math.random() * presences.length)],
            ],
        });
    }

    async userFromMentionOrId(idOrMention) {
        let user = null;
        if (idOrMention) {
            if (idOrMention.startsWith("<@")) {
                user = this.userFromMention(idOrMention) ?? null;
            }
            if (!isNaN(parseInt(idOrMention))) {
                user = (await this.client.users.fetch(idOrMention)) ?? null;
            }
        }
        return user;
    }

    userFromMention(mention) {
        const { client } = this;
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/);

        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return null;

        // However, the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];

        return client.users.cache.get(id);
    }

    channelIdFromMention(mention) {
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<#!?(\d+)>$/);

        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return null;

        // However, the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        return matches[1];
    }

    roleIdFromMention(mention) {
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@&?(\d+)>$/);

        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return null;

        // However, the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        return matches[1];
    }

    async fetchBot(id, optional = false) {
        const { client } = this;
        let bot = null;
        try {
            bot = await client.users.fetch(id);
        } catch (e) {
            if (client.debug) console.log(e);
            if (!optional)
                return (
                    "/bots?error=true&message=" +
                    encodeURIComponent("Invalid bot ID")
                );
        }
        let botDB = null;
        try {
            botDB = await client.db.findBot(bot.id);
        } catch (e) {
            if (client.debug) console.log(e);
            if (!optional)
                return (
                    "/bots?error=true&message=" +
                    encodeURIComponent("Bot not found in DB")
                );
        }
        return { bot, botDB };
    }

    //https://flexiple.com/find-duplicates-javascript-array/
    findArrDups(array) {
        //find duplicates in an array
        return array.filter((val, index) => {
            return array.indexOf(val) !== index;
        });
    }

    //https://dev.to/huyddo/find-duplicate-or-repeat-elements-in-js-array-3cl3
    findArrDups2(array) {
        const count = {};
        const result = [];

        array.forEach((item) => {
            if (!count[item]) count[item] = 0;
            count[item]++;
        });

        for (const prop in count) {
            if (count[prop] > 1) {
                result.push(prop);
            }
        }

        if (this.client?.debug) console.log(count, array);
        return result;
    }

    diff(arr1, arr2, highlight = true) {
        if (!arr2)
            throw new TypeError(
                "Array#diff: argument 1 (arr2) is not provided"
            );
        return arr1
            .filter((x) => !arr2.includes(x))
            .map((x) => (highlight ? `- ${x}` : x))
            .concat(
                arr2
                    .filter((x) => !arr1.includes(x))
                    .map((x) => (highlight ? `+ ${x}` : x))
            ); //symmetric difference
    }

    async handleBotData(data) {
        const { client } = this;
        const params = new URLSearchParams();
        params.set("error", "true");
        const botData = {
            botId: data.botId,
            prefix: data.prefix,
            descriptions: {
                short: data.shortDesc,
                long: data.longDesc,
            },
            owner: data.owner,
            addedAt: Date.now(),
            apiToken: this.genToken(),
        };
        if (data["website"]) {
            let url = null;
            try {
                url = new URL(data["website"]);
            } catch (e) {
                if (client.debug) console.log(e);
            }
            if (!url) {
                params.set("message", "Invalid website link");
                return `/bots/add?${params}`;
            }
            botData["website"] = data["website"];
        }
        if (data["github"]) {
            let url = null;
            try {
                url = new URL(data["github"]);
            } catch (e) {
                if (client.debug) console.log(e);
            }
            if (!url) {
                params.set("message", "Invalid github link");
                return `/bots/add?${params}`;
            }
            botData["github"] = data["github"];
        }
        if (data["support"]) {
            let url = null;
            try {
                url = new URL(data["support"]);
            } catch (e) {
                if (client.debug) console.log(e);
            }
            if (!url) {
                params.set("message", "Invalid support server link");
                return `/bots/add?${params}`;
            }
            const code = url.pathname.replace("invite/", "");
            const json = await axios.get(
                `https://discord.com/api/invite/${code}`
            );
            if (json.message === "Unknown Invite") {
                params.set(
                    "message",
                    "Invalid support server invite code or you used a url shortner"
                );
                return `/bots/add?${params}`;
            } else {
                // the invite is valid, nvm
            }
            botData["support"] = data["support"];
        }
        return botData;
    }
}
module.exports = Util;
