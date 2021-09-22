/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { Collection } = require("discord.js");
module.exports = class DBCache {
    constructor(client) {
        this.client = client;
        this.bots = new Collection();
        this.models = {
            Bot: require("./models/Bot"),
        };
        setInterval(() => {
            this.refreshCache();
        }, this.client.config.dbCacheRefreshInterval);
    }

    refreshCache() {
        this.models = {
            Bot: require("./models/Bot"),
        };
        this.client.logger.log("Refreshing db cache", "debug");
        this.bots.each((botDB) => {
            const { botId: id } = botDB;
            this.bots.delete(id);
            this.findBot(id);
        });
    }

    async findBot(botId) {
        if (this.bots.get(botId)) {
            return this.bots.get(botId);
        } else {
            //let botDB = await this.models.Bot.findOne({ botId });
            const botDB = await this.models.Bot.findOne({ botId });
            if (botDB) {
                this.bots.set(botDB.botId, botDB);
                return botDB;
            } else {
                return null;
            }
        }
    }

    deleteBot(botId) {
        return new Promise((resolve, reject) => {
            this.models.Bot.where({ botId }).deleteOne((err) => {
                if (err) {
                    return reject("Could not delete bot");
                } else {
                    this.bots.delete(botId);
                    return resolve("Bot Deleted");
                }
            });
        });
    }
};
