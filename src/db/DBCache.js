/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */
const { Collection } = require("discord.js");
module.exports = class DBCache {
    constructor(client) {
        this.client = client;
        this.bots = new Collection();
        this.users = new Collection();
        this.models = {
            Bot: require("./models/Bot"),
            User: require("./models/User"),
        };
        setInterval(() => {
            this.refreshCache();
        }, this.client.config.dbCacheRefreshInterval);
    }

    refreshCache() {
        this.client.logger.log("Refreshing db cache", "debug");
        this.bots.each((botDB) => {
            const { botId: id } = botDB;
            this.bots.delete(id);
            this.findBot(id);
        });
        this.users.each((userDB) => {
            const { userId: id } = userDB;
            this.users.delete(id);
            this.findOrCreateUser(id);
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

    async findOrCreateUser(userId) {
        if (this.users.get(userId)) {
            return this.users.get(userId);
        } else {
            let userDB = await this.models.User.findOne({ userId });
            if (userDB) {
                this.users.set(userDB.userId, userDB);
                return userDB;
            } else {
                if (this.client.debug) {
                    this.client.logger.log(
                        `Creating user (${userId}) in db`,
                        "debug"
                    );
                }
                userDB = new this.models.User({ userId });
                await userDB.save();
                this.users.set(userDB.userId, userDB);
                return userDB;
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
