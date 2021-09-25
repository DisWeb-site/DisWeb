const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /bots
router.get("/", async (req, res) => {
    const bots = await req.client.models.Bot.find({});
    bots.forEach(async ({ botId }) => {
        await req.client.users.fetch(botId);
    });
    res.render("bots/index", {
        req,
        bots,
    });
});
//GET /bots/add
router.get("/add", CheckAuth, async (req, res) => {
    const { client } = req;
    const member = await client.guilds.cache
        .get(client.config.servers.main.id)
        .members.fetch(req.user.id);
    if (!member)
        return res.redirect(
            "/bots?error=true&message=" +
                encodeURIComponent(
                    "To do this, you have to join our discord server."
                )
        );
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
    if (client.debug) console.log(data);
    const reqFields = ["shortDesc", "longDesc", "prefix"];
    params.set("error", "true");
    if (isNaN(botId)) {
        params.set("message", "Bot ID is not a number");
        return res.redirect(`/bots/add?${params}`);
    } else if (await req.client.models.Bot.findOne({ botId })) {
        params.set("message", "Bot already exists in DB");
        return res.redirect(`/bots/add?${params}`);
    }
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        if (!Object.keys(data).includes(field)) {
            params.set("message", "Required fields are missing");
            return res.redirect(`/bots/add?${params}`);
        }
    }
    const botData = {
        botId: botId,
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
    params.set("message", "Your bot is added!");
    res.redirect(`/bots/${botId}?${params}`);
});
module.exports = router;
