/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Permissions } = require("discord.js");
module.exports = {
    site: {
        //site settings
        port: process.env.PORT ?? 3000,
        secret: process.env.CLIENT_SECRET ?? "rejsaiewsdamsa",
        url: "https://uplist-production.up.railway.app",
    },
    channels: {
        //important channels
        //when a user logins
        loginLogs: "890244366189350953",
        //channel where all errors are sent, keep null to disable error logging in a channel
        errorLogs: "890175972207394847",
        //new bot, bot edited, etc logs
        botLogs: "891338310339919892",
        //new server, server edited, etc logs
        serverLogs: "904970408783130644", //Tip: keep the same id as botLogs if you use same channel
        //bug reports, etc for report command
        reportLogs: "887493136048345134",
        //bot uptime logs
        uptimeLogs: "892416911663591456",
        //suggestions, etc for suggest command
        suggestionLog: "887493136048345132",
        //vote logs
        voteLogs: "895576180072251404",
        //find a bot by sending a message in this channel
        findabot: "904602691660046336", //Tip: keep null to disable find a bot channel
    },
    roles: {
        //roles
        reviewer: ["890204725448962080", "890561802964967445"], //can be array of role ids or string
        developer: "894566888611385395",
        promoted: "890617290511511624", //role for promoted bots
        staff: "890390501855993906", //role for staff, all staff can use the /admin route
    },
    emojis: {
        //some emojis
        approved: "<:YesMark:891123032725282877>",
        rejected: "<:NoMark:891122870938378260>",
        deleted: "<:NoMark:891122870938378260>",
        offline: "<:offline:892453833664520302>",
        online: "<:online:892453879487283221>",
    },
    servers: {
        main: {
            //main server details
            id: "887493135649894440",
            invite: "https://discord.com/invite/eJaF88zwcM",
        },
        test: {
            //test server details
            id: "890560485991276565",
        },
    },
    invite: (client) => {
        return client.generateInvite({
            scopes: ["bot", "applications.commands"],
            permissions: [
                Permissions.FLAGS.CREATE_INSTANT_INVITE,
                Permissions.FLAGS.MANAGE_GUILD,
                Permissions.FLAGS.EMBED_LINKS,
                Permissions.FLAGS.SEND_MESSAGES,
                Permissions.FLAGS.READ_MESSAGE_HISTORY,
            ],
        });
    },
    owners: ["815204465937481749", "797266146000633888", "693754859014324295"], //owners who can use eval like commands
    adsCode: "297-240-3472", //google ads code, comment out if you don't want
    prefix: process.env.BOT_PREFIX ?? "d/", //bot prefix
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
    minimumDays: 2, //minimum days for a bot to be allowed to get approved, set to 0 if you don't want this
};
