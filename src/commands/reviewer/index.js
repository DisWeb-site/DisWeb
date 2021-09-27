/**
 * UpList
 * Copyright (c) 2021 The UpList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const commands = require("fs")
    .readdirSync(__dirname)
    .filter((file) => file !== "index.js" && file.endsWith(".js"))
    .map((file) => require(`${__dirname}/${file}`));

module.exports = {
    commands,
    metadata: {
        name: "Bot reviewer",
        key: "reviewer",
        emoji: "<:staff:890772702066003989>",
    },
};
