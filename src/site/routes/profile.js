/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /profile
router.get("/", CheckAuth, (req, res) => {
    res.redirect(`/profile/${req.user.id}`);
});
//GET /profile/:userId
router.get("/:userId", async (req, res) => {
    const { client } = req;
    const user = await client.users.fetch(req.params.userId);
    if (!user)
        return res.redirect(
            `/?error=true&message=${encodeURIComponent("User not found")}`
        );
    let bots = await client.models.Bot.find({});
    bots = bots.filter((bot) => {
        const owners = [bot.owner]; //this format for easily including co-owners for bot after co owners feature is added
        return owners.includes(user.id);
    });
    bots.forEach(async (botDB) => {
        await client.users.fetch(botDB.botId);
    });
    res.render("profile", {
        req,
        bots,
        user,
    });
});
module.exports = router;
