/**
 * UpList
 * Copyright (c) 2021 The UpList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
module.exports = {
    site: {
        port: process.env.PORT ?? 3000,
        secret: process.env.CLIENT_SECRET ?? "rejsaiewsdamsa",
        url: "https://dislist-production.up.railway.app",
    },
    channels: {
        loginLogs: "890244366189350953",
        errorLogs: "890175972207394847",
        botLogs: "891338310339919892",
    },
    roles: {
        reviewer: ["890204725448962080", "890561802964967445"], //can be array of role ids or string
    },
    emojis: {
        approved: "<:YesMark:891123032725282877>",
        rejected: "<:NoMark:891122870938378260>",
    },
    servers: {
        main: {
            id: "887493135649894440",
            invite: "https://discord.com/invite/eJaF88zwcM",
        },
        test: {
            id: "890560485991276565",
        },
    },
    owners: ["815204465937481749", "797266146000633888", "693754859014324295"],
    prefix: process.env.BOT_PREFIX ?? "d/",
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
};
