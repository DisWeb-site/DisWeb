/**
 * DisList
 * Copyright (c) 2021 The DisList Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /
router.get("/", (req, res) => {
    res.redirect("/bots");
});
//GET /login
router.get("/login", CheckAuth, (req, res) => {
    res.redirect("/discord/login");
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
//GET /privacy-policy
router.get("/privacy-policy", (req, res) => {
    res.send("Coming Soon");
});
module.exports = router;
