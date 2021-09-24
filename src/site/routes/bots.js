const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /bots
router.get("/", (req, res) => {
    const bots = req.client.models.Bot.find({});
    res.render("bots/index", {
        req,
        bots,
    });
});
//GET /bots/add
router.get("/add", CheckAuth, (req, res) => {
    res.render("bots/add", {
        req,
    });
});
//GET /bots/rules
router.get("/rules", (req, res) => {
    res.render("bots/rules", {
        req,
    });
});
//POST /bots/add
router.post("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const params = new URLSearchParams();
    const data = req.body;
    const botId = parseInt(data.botId);
    let bot;
    try {
        bot = await client.users.fetch(botId);
    } catch (e) {
        if (client.debug) console.log(e);
    }
    const reqFields = ["shortDesc", "longDesc", "prefix"];
    params.set("error", "true");
    if (isNaN(botId)) {
        params.set("message", "Bot ID is not a number");
        return res.redirect(`/bots/add?${params}`);
    } else if (!Object.keys(data).includes(reqFields)) {
        params.set("message", "Required fields are missing");
        return res.redirect(`/bots/add?${params}`);
    } else if (await req.client.models.Bot.findOne({ botId })) {
        params.set("message", "Bot already exists in DB");
        return res.redirect(`/bots/add?${params}`);
    }
    const botData = {
        botId: bot.id,
        prefix: data.prefix,
        descriptions: {
            short: data.shortDesc,
            long: data.longDesc,
        },
        owner: req.user.id,
        addedAt: Date.now(),
    };
    for (const i in data) {
        if (!["website", "support", "github"].includes(i)) return;
        botData[i] = data[i];
    }
    const botDB = new client.client.models.Bot(botData);
    await botDB.genApiToken();
    await botDB.save();
    params.delete("error");
    params.set("sucess", "true");
});
module.exports = router;
