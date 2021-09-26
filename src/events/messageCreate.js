module.exports = {
    name: "messageCreate",
    once: false,
    async execute(client, message) {
        if (client.debugLevel > 0)
            client.logger.log("messageCreate event", "debug");
        if (!client.initialized) return;
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#optional_chaining_operator
        if (!client.application?.owner) await client.application?.fetch();
        if (message.channel?.partial) await message.channel.fetch();
        if (message?.partial) await message.fetch();
        if (message.author.bot) return;
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const prefixes = [escapeRegex(client.config.prefix.toLowerCase())];
        const prefixRegex = new RegExp(
            `^(<@!?${client.user.id}> |${prefixes.join("|")})\\s*`
        );
        let prefix = null;
        try {
            [, prefix] = message.content.toLowerCase().match(prefixRegex);
        } catch (e) {} //eslint-disable-line no-empty
        if (prefix) {
            const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command =
                client.commands.enabled.get(commandName) ||
                client.commands.enabled.find(
                    (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
                );
            if (!command || typeof command === "undefined") {
                if (client.debug && client.debugLevel > 0)
                    client.logger.log(`Can't find command: ${commandName}`);
                return;
            }
            if (command.disabled) return;
            if (
                command.requirements?.ownerOnly &&
                !client.config.owners.includes(message.author.id)
            )
                return;
            if (command.requirements?.guildOnly && !message.guild)
                return message.channel.send(
                    "Uhhhhhhhhhhh, this command can be used in servers only"
                );
            if (
                command.requirements?.reviewerOnly &&
                client.config.roles.reviewer
            ) {
                const reply =
                    "You don't have the bot reviewer role to use this command";
                if (
                    typeof client.config.roles.reviewer === "string" &&
                    !message.member.roles.cache.has(
                        client.config.roles.reviewer
                    )
                ) {
                    return message.channel.send(reply);
                } else if (typeof client.config.roles.reviewer === "array") {
                    const has = [];
                    message.member.roles.cache.forEach((r) => {
                        if (client.config.roles.reviewer.includes(r.id))
                            has.push(r.id);
                    });
                    if (!has || !has.length || !has[0])
                        return message.channel.send(reply);
                }
            }
            message.channel.sendTyping().catch(() => {});
            command.execute({ prefix, message, args });
        }
        const mentionRegex = new RegExp(
            `^(<@!?${message.client.user.id}>)\\s*`
        );
        if (message.content.split(" ").length > 1) return;
        if (!mentionRegex.test(message.content)) return;
        const reply = `Hi there, ${message.author}\nI am ${message.client.user.username}\nMy prefix is "${client.config.prefix}"\nSend \`${client.config.prefix}help\` to get help`;
        if (!message.reference) {
            message.channel.sendTyping().catch(() => {});
            message.channel.send(reply);
        } else {
            message.channel.messages
                .fetch(message.reference.messageId)
                .then((msg) => {
                    if (msg.author.id !== client.user.id) {
                        message.channel.sendTyping();
                        message.channel.send(reply);
                    }
                })
                .catch(console.error);
        }
    },
};
