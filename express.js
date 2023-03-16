import express from "express";
import chalk from "chalk";

export default class ExpressServer {
    /**
     * @param {number} port
     * @param {import("./twitch").default} twitchChat
     * @param {import("./ai").default} chatai
     */
    constructor(port, twitchChat, chatai, config = {}) {
        this.port = port || 3000;
        this.twitchChat = twitchChat;
        this.chatai = chatai;
        this.config = config;
        this.app = express();
        this.app.use(express.static("public"));
        this.app.use(express.json());
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.post("/use-config", (req, res) => {
            for (const config of Object.keys(this.config)) {
                if (req.body[config] != null) {
                    this.config[config] = req.body[config];
                }
            }

            console.log(chalk.yellow("Config updated!!"));
            res.send("Config saved successfully");
        });

        this.app.get("/get-config", (req, res) => {
            res.send(this.config);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(chalk.underline.yellow(`Server listening!`, `http://localhost:${this.port}`));
        });
    }
}