/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by UpList
 */
const commands = require("fs")
    .readdirSync(__dirname)
    .filter((file) => file !== "index.js" && file.endsWith(".js"))
    .map((file) => require(`${__dirname}/${file}`));

module.exports = {
    commands,
    metadata: {
        name: "Core",
        key: "core",
        emoji: ":robot:",
    },
};
