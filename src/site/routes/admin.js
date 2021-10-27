/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /
router.get("/", CheckAuth, async (req, res) => {
    let member;
    try {
        member = await req.client.servers.main.members.fetch(req.user.id);
    } catch (e) {
        if (req.client.debugLevel > 1) console.log(e);
    }
    if (!member)
        return res.redirect(
            `/?error=true&message=${encodeURIComponent(
                "You are not even in the server of DisWeb, how can I say that you are a staff lol"
            )}`
        );
    if (!member.roles.cache.has(req.client.config.roles.staff))
        return res.redirect(
            `/?error=true&message=${encodeURIComponent("You are not a staff")}`
        );
    const stats = new Map();
    await req.client.models.Stats.find({}).then((stats2) => {
        stats2.forEach((stat) => {
            stats.set(stat.userId, stat);
        });
    });
    res.render("admin/index", {
        req,
        member,
        stats,
        statsArray: [...stats.values()],
    });
});
module.exports = router;
