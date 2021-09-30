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
//error handler
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
//Delete bots which go under 30% uptime rate & give uptime 0.01% to all other bots
setInterval(async () => {
    if (!client) return;
    const bots = await client.models.Bot.find({});
    const channel = await client.channels.fetch(client.config.channels.botLogs);
    bots.forEach((botDB) => {
        if (botDB.uptime.rate < 30) {
            client.models.Bot.findOneAndDelete({ botId: botDB.botId });
            if (channel) {
                channel.send({
                    content: `<@${botDB.owner}>`,
                    embeds: [
                        {
                            title: "Bot Deleted :x:",
                            description: `<@${botDB.botId}> has been removed from the system`,
                            fields: [
                                {
                                    name: "**Reason**",
                                    value: "Uptime rate has reduced to <30 (less than 30)",
                                    inline: true,
                                },
                            ],
                        },
                    ],
                });
            }
        } else if (botDB.uptime.rate < 100) {
            botDB.uptime.rate = botDB.uptime.rate + 0.12;
        }
    });
}, 1 * 60 * 60 * 1000); //every hour
client.login(process.env.DISCORD_TOKEN);
