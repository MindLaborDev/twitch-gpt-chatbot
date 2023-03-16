import TwitchChat from "./twitch.js";
import { roastBot } from "./context.js";
import ChatAI from "./ai.js";
import { config } from "dotenv";
import ExpressServer from "./express.js";
config(); 

const GLOBAL_BLOCKED_USERS = ["StreamElements", "buttsbot"];
const APP_CONFIG = {
    channels: {
        "goosychan": {
            name: "GoosyChan",
            blockedUsers: [...GLOBAL_BLOCKED_USERS],
            tts: false,
            aiSystemContext: roastBot,
            memorySize: 8,
            reponseChance: 1,
            autoChat: true,
            autoChatMessageFrequency: 3
        },
    },
};

const chatai = new ChatAI();
const twitchChat = new TwitchChat(
    Object.keys(APP_CONFIG.channels),
    chatai,
    {},
    APP_CONFIG.channels,
);

new ExpressServer(3000, twitchChat, chatai, APP_CONFIG).start();
