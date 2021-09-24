module.exports = {
    site: {
        port: process.env.PORT ?? 3000,
        secret: process.env.CLIENT_SECRET ?? "rejsaiewsdamsa",
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
    },
    prefix: "d/",
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
};
