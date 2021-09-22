const { Permissions } = require("discord.js");
class Util {
    constructor(client) {
        this.client = client;
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

    async fetchUser(userData) {
        const { client } = this;
        if (userData.guilds) {
            for (let i = 0; i < userData.guilds.length; i++) {
                let guild = userData.guilds[i];
                const perms = new Permissions(BigInt(guild.permissions));
                let admin = false;
                if (perms.has(Permissions.FLAGS.MANAGE_GUILD) || guild.owner) {
                    admin = true;
                }
                const djsGuild = (await client.guilds.fetch(guild.id)) ?? null;
                if (djsGuild && djsGuild.id) {
                    guild = djsGuild;
                    guild.botInvited = true;
                } else {
                    guild.botInvited = false;
                }
                guild.admin = admin;
                guild.manageUrl = `/manage/${guild.id}`;
                guild.iconURL = guild.icon
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                    : "https://emoji.gg/assets/emoji/discord.png";
                userData.guilds[i] = guild;
            }
            userData.displayedGuilds = userData.guilds.filter((g) => g.admin);
        }
        client.db.findOrCreateUser(userData.id);
        const user = await client.users.fetch(userData.id);
        return { user, userData };
    }

    CheckAuth(req, res, next) {
        if (req.client.debug) console.log("Checking auth");
        if (!req.user || !req.session.user) {
            const redirectUrl =
                req.originalUrl.includes("login") || req.originalUrl === "/"
                    ? "/dashboard"
                    : req.originalUrl;
            const state = Math.random().toString(36).substring(5);
            req.client.site.states[state] = redirectUrl;
            return res.redirect(
                `/discord/login?state=${encodeURIComponent(state)}`
            );
        }
        return next();
    }
}
module.exports = Util;
