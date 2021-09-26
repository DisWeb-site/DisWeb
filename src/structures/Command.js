module.exports = class Command {
    constructor(opts, client) {
        this.client = client;
        const { createOptionHandler } = client.util;
        const options = createOptionHandler("Command", opts);
        this.name = options.required("name");
        this.description = options.optional("description", "Not provided");
        this.aliases = options.optional("aliases", null);
        this.requirements = options.optional("requirements", {
            args: false,
            subcommand: false,
            guildOnly: false,
            ownerOnly: false,
            reviewerOnly: false,
        });
        this.usage = options.optional("usage", null);
        this.disabled = options.optional("disabled", false);
        this.category = options.optional("category", "General");
        if (this.name.includes("-")) {
            this.aliases.push(this.name.replace(/-/g, ""));
        }
        if (this.aliases) {
            for (let i = 0; i < this.aliases.length; i++) {
                const alias = this.aliases[i];
                if (alias.includes("-")) {
                    const alias2 = alias.replace(/-/g, "");
                    if (this.name !== alias2) this.aliases.push(alias2);
                }
            }
        }
    }
};
