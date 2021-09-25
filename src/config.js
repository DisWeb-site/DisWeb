module.exports = {
    site: {
        port: process.env.PORT ?? 3000,
        secret: process.env.CLIENT_SECRET ?? "rejsaiewsdamsa",
        url: "https://dislist-production.up.railway.app"
    },
    channels: {
        loginLogs: "890244366189350953",
        errorLogs: "890175972207394847",
    },
    servers: {
        main: {
            id: "887493135649894440",
            invite: "https://discord.com/invite/eJaF88zwcM",
        },
        test: {
            id: "890560485991276565"
        },
    },
    owners: ["815204465937481749", "797266146000633888", "693754859014324295"],
    prefix: process.env.BOT_PREFIX ?? "d/",
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
};
