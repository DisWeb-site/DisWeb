module.exports = {
    site: {
        port: process.env.PORT ?? 3000,
        secret: "rkoerasevfevfd",
    },
    channels: {
        loginLogs: "890244366189350953",
        errorLogs: "890175972207394847",
    },
    prefix: "d/",
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
};
