const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports.load = (client) => {
    const { CheckAuth, fetchUser } = client.util;
    global.CheckAuth = CheckAuth;
    const session = require("express-session");
    if (client.debug) client.logger.debug("Loading dashboard");
    const app = express();
    app.use(express.urlencoded({ extended: true }))
        .use(express.json())
        //static files
        .use(express.static(path.join(__dirname, "public")))
        //Set engine to html for embedded js template
        .engine("html", require("ejs").renderFile)
        .set("view engine", "ejs")
        // Set the ejs templates to ./views
        .set("views", path.join(__dirname, "/views"))
        //Set express session
        .use(
            session({
                secret: client.config.site.secret,
                resave: false,
                saveUninitialized: false,
            })
        )
        //Set port
        .set("port", client.config.site?.port || 3000)
        //Adding new shortcuts by extending like a plugin
        .use(async (req, res, next) => {
            req.client = client;
            req.userData = req.session.user ?? null;
            req.user = null;
            if (req.userData) {
                const userInfos = await fetchUser(req.userData, req.client);
                req.user = userInfos.user;
                req.userData = userInfos.userData;
            }
            if (!req.user) req.user = null;
            req.currentURL = `${req.protocol}://${req.get("host")}${
                req.originalUrl
            }`;
            next();
        });

    const routesFolder = path.join(__dirname, "/routes");
    const routesFiles = fs
        .readdirSync(routesFolder)
        .filter((file) => file.endsWith(".js"));
    for (const file of routesFiles) {
        let f = file.replace(".js", "");
        if (f.indexOf("index") > -1) f = "/";
        else f = `/${f}`;
        try {
            app.use(f, require(`${routesFolder}/${f}`));
        } catch (e) {
            console.error(e);
        }
    }

    app
        // Since this is the last non-error-handling we assume 404.
        .use((req, res) => {
            if (req.accepts("html")) {
                res.render("404", {
                    user: req.user,
                    userData: req.userData,
                    currentURL: req.currentURL,
                    req: req,
                });
            } else if (req.accepts("json")) {
                res.json({ error: "404", message: "Page Not Found" });
            } else {
                return res.type("txt").sendStatus(404);
            }
            res.status(404);
            res.end();
        })
        //Error handler
        .use(CheckAuth, (err, req, res, next) => {
            console.error(err.stack);
            if (!req.user) return res.redirect("/");
            if (req.accepts("html")) {
                res.render("500", {
                    user: req.user,
                    userData: req.userData,
                    currentURL: req.currentURL,
                    req: req,
                });
            } else if (req.accepts("json")) {
                res.json({ error: "500", message: "Internal Server Error" });
            } else {
                return res.type("txt").sendStatus(500);
            }
            res.status(500);
            res.end();
        });

    app.listen(app.get("port"), () => {
        console.log(`Site running on port ${app.get("port")}`);
    });
};
