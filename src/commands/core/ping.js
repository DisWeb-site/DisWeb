//eslint-disable-next-line no-unused-vars
const { Command } = require("../../structures");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "ping",
                description: "Get the ping of the bot",
                aliases: ["latency", "pong"],
                disabled: false,
                category: "Core",
            },
            client
        );
    }

    execute({ message }) {
        const msg = `Pong ${message.author}\nWebsocket heartbeat: ${message.client.ws.ping}ms.\n`;
        message.reply(msg + `Getting roundtrip latency`).then((sent) => {
            sent.edit(
                msg +
                    `Roundtrip latency: ${
                        sent.createdTimestamp - message.createdTimestamp
                    }ms`
            );
        });
    }
};
