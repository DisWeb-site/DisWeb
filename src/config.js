/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
module.exports = {
    site: {
        //site settings
        port: process.env.PORT ?? 3000,
        secret: process.env.CLIENT_SECRET ?? "rejsaiewsdamsa",
        url: "https://uplist-production.up.railway.app",
    },
    channels: {
        //important channels
        loginLogs: "890244366189350953",
        errorLogs: "890175972207394847",
        botLogs: "891338310339919892",
        reportLogs: "887493136048345134",
        uptimeLogs: "892416911663591456",
    },
    roles: {
        //roles
        reviewer: ["890204725448962080", "890561802964967445"], //can be array of role ids or string
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
    owners: ["815204465937481749", "797266146000633888", "693754859014324295"], //owners who can use eval like commands
    prefix: process.env.BOT_PREFIX ?? "d/", //bot prefix
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
    minimumDays: 2, //minimum days for a bot to be allowed to get approved, set to 0 if you don't want this
};
