/**
 * DisWeb
 * Copyright (c) 2021 The DisWeb Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /
router.get("/", async (req, res) => {
    const bots = await req.client.models.Bot.find({});
    bots.forEach(async ({ botId }) => {
        await req.client.users.fetch(botId);
    });
    const users = await req.client.models.User.find({});
    users.forEach(async ({ userId }) => {
        await req.client.users.fetch(userId);
    });
    res.render("index", {
        req,
        bots: bots.filter((b) => b.approved),
        botsNotApp: bots.filter((b) => !b.approved),
        allBots: bots,
        users,
    });
});
//GET /login
router.get("/login", CheckAuth, (req, res) => {
    res.redirect("/");
});
//GET /logout
router.get("/logout", async (req, res) => {
    await req.session.destroy();
    res.send("Logged out");
    res.end();
});
//GET /team
router.get("/team", (req, res) => {
    res.render("team", {
        req,
    });
});
//GET /about
router.get("/about", (req, res) => {
    res.render("about", {
        req,
    });
});
//GET /team
router.get("/terms", (req, res) => {
    res.render("terms", {
        req,
    });
});
//GET /privacy
router.get("/privacy", (req, res) => {
    res.render("privacy", {
        req,
    });
});
module.exports = router;
