/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
require("dotenv").config();
const DisWeb = require("./DisWeb");
const client = new DisWeb();
const mongoose = require("mongoose");
// eslint-disable-next-line no-undef
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB: ", err);
    });
process.on("unhandledRejection", (error) => {
    client.logger.log("Unhandled promise rejection", "error");
    console.error(error);
    const channel =
        client.channels.cache.get(client?.config?.channels?.errorLogs) ?? null;
    if (channel)
        channel
            .send({
                embeds: [
                    {
                        title: ":x: An error occurred",
                        description: `${error}`,
                        fields: [
                            {
                                name: "Stack trace",
                                value: `${error.stack}`,
                                inline: true,
                            },
                        ],
                    },
                ],
            })
            .catch(() => {});
});
client.login(process.env.DISCORD_TOKEN);
