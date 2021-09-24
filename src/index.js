require("dotenv").config();
const DisList = require("./DisList");
const client = new DisList();
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
