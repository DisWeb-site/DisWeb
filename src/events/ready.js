/**
 * UpList
 * Copyright (c) 2021 The UpList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
module.exports = {
    name: "ready",
    once: true,
    execute: (client) => {
        client.logger.log(
            `${client.user.username}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers`
        );
        client.util.presence();
        // 1 * 60 * (1 second)
        // Update presence every 1 minute
        setInterval(() => client.util.presence(), 1 * 60 * 1000);
    },
};
