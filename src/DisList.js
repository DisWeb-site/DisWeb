/**
 * DisList
 * Copyright (c) 2021 The DisList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Client, Intents } = require("discord.js");
const Logger = require("colors-logger");
const util = require("util");
const config = require("./config");
const DBCache = require("./db/DBCache");
const Util = require("./Util");
class DisList extends Client {
    constructor(opts) {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_PRESENCES,
            ],
            partials: ["CHANNEL"],
        });
        this.config = config;
        this.logger = new Logger();
        this.initialized = false;
        this.db = new DBCache(this);
        this.wait = util.promisify(setTimeout); // await client.wait(1000) - Wait 1 second
        this.debug = opts?.debug || process.env.NODE_ENV === "development";
        this.debugLevel = opts?.debugLevel || process.env?.DEBUG_LEVEL || 0;
        this.util = new Util(this);
        this.site = require("./site/app");
        this.site.states = {};
        this.site.load(this);
        this.initialize();
    }

    initialize() {
        ["Event", "Command"].forEach((f) => {
            if (this.debug) this.logger.log(`Loading ${f}s`);
            require(`./loaders/${f}`)(this);
            if (this.debug) this.logger.log(`Finished loading ${f}s`);
        });
        this.initialized = true;
        this.emit("initialized");
    }

    setCmd(CMD) {
        const command = new CMD(this);
        if (!command?.disabled) {
            this.commands.enabled.set(command.name, command);
        } else {
            this.commands.disabled.set(command.name, command);
        }
        return command;
    }

    get models() {
        return this.db.models;
    }
}
module.exports = DisList;
