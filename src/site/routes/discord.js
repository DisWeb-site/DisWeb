/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 * Modified by DisWeb
 */
const express = require("express");
const router = express.Router();
//const { MessageEmbed } = require("discord.js");
const btoa = require("btoa");
const fetch = require("node-fetch");
//GET /discord
router.get("/", (req, res) => {
    res.redirect(`${req.client.config.servers.main.invite}`);
});
//GET /discord/login
router.get("/login", (req, res) => {
    if (req.user) res.redirect("/dashboard");
    else
        res.redirect(
            `https://discord.com/api/oauth2/authorize?client_id=${
                req.client.user.id
            }&redirect_uri=${encodeURIComponent(
                `${req.protocol}://${req.get("host")}/discord/callback`
            )}&response_type=code&scope=identify%20guilds%20guilds.join&state=${
                req.query?.state || "null"
            }`
        );
});
//GET /discord/callback
router.get("/callback", async (req, res) => {
    if (!req.query.code) return res.redirect("/");
    /*if (req.client.site.states[req.query?.state] !== atob(decodeURIComponent(req.query?.state))) {
        return res.send("You may have been clickjacked!");
    }*/
    const redirectUrl = req.client.site.states[req.query?.state] ?? "/";
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", req.query.code);
    params.set(
        "redirect_uri",
        `${req.protocol}://${req.get("host")}/discord/callback`
    );
    let response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: params.toString(),
        headers: {
            Authorization: `Basic ${btoa(
                `${req.client.user.id}:${req.client.config.site.secret}`
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const tokens = await response.json();
    if (tokens.error || !tokens.access_token) {
        if (req.client.debug && process.env.NODE_ENV === "development")
            console.log(tokens);
        return res.redirect(`/discord/login?state=${req.query?.state}`);
    }
    const userData = {
        infos: null, //Basic info like user id, tag, username, etc.
        guilds: null,
    };
    while (!userData.infos || !userData.guilds) {
        if (!userData.infos) {
            response = await fetch("http://discord.com/api/users/@me", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.infos = json;
        }

        if (!userData.guilds) {
            response = await fetch("http://discord.com/api/users/@me/guilds", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.guilds = json;
        }
    }
    /* Change format (from "0": { data }, "1": { data }, etc... to [ { data }, { data } ]) */
    const guilds = [];
    for (const index in userData.guilds) guilds.push(userData.guilds[index]);
    let done;
    while (!done) {
        if (!guilds.find((g) => g.id === req.client.config.servers.main.id)) {
            response = await fetch(
                `http://discord.com/api/guilds/${req.client.config.servers.main.id}/members/${userData.infos.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bot ${req.client.token}`
                    },
                    body: JSON.stringify({
                        access_token: `${tokens.access_token}`
                    }),
                }
            );
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else done = true;
            if (req.client.debug) console.log(json);
        }
    }
    if (req.client.debug) {
        console.log(
            "Is user in the support server  previously?",
            !!guilds.find((g) => g.id === req.client.config.servers.main.id)
        );
    }
    req.session.user = {
        ...userData.infos,
        guilds,
    };
    const user = await req.client.users.fetch(req.session.user.id);
    //const userDB = await req.client.db.models.User.findOne({ userId: req.session.user.id });
    if (user) {
        const channel = await req.client.channels
            .fetch(req.client.config.channels.loginLogs)
            .catch(() => {});
        if (channel)
            channel.send(`${user.tag} (${user.id}) has logged in to the site`);
    }
    res.redirect(redirectUrl);
});
module.exports = router;
