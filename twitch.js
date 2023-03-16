import tmi from "tmi.js";
import chalk from "chalk";

export default class TwitchChat {
    /**
     * @param {string[]} channels
     */
    constructor(channels, chatai, options = {}, channelOptions = {}) {
        this.channels = channels;
        this.chatai = chatai;
        this.options = options;
        this.channelOptions = channelOptions;
        this.messagesIndex = 0;
        /**
         * @type {Record<string, {role: "system" | "user" | "assistant", content: string}[]>}
         */
        this.channelMessages = Object.fromEntries(channels.map(channel => [channel, []]));
        this.client = new tmi.Client({
            connection: {
                secure: true,
                reconnect: true
            },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.TWITCH_OAUTH_TOKEN
            },
            channels: channels
        });
        this.client.connect();
        this.setupListeners();
    }

    setupListeners() {
        this.client.on("message", (channel, userstate, message, self) => {
            channel = channel.slice(1);

            const channelMessages = this.channelMessages[channel];
            const channelOptions = this.channelOptions[channel];

            if (this.channelOptions[channel].blockedUsers.includes(userstate.username)) return;
            if (message.trim().startsWith("!")) return;
            if (channelMessages.length >= channelOptions.memorySize) {
                channelMessages.shift();
            }

            channelMessages.push({
                role: self ? "assistant" : "user",
                content: `${userstate.username}: ${message}`,
            });
            if (self) return;

            console.log(chalk.greenBright(`[${channel}] ${userstate.username}: ${message}`));
            this.messagesIndex++;

            const isTagging =
                message.toLowerCase().includes("@goosyai") ||
                message.toLowerCase().includes("@ goosyai");

            const autoChatAllow =
                channelOptions.autoChat &&
                this.messagesIndex % channelOptions.autoChatMessageFrequency === 0;

            const taggingAllow =
                isTagging &&
                Math.random() <= channelOptions.reponseChance;

            if (autoChatAllow || taggingAllow) {
                this.chatai.generateMessage([
                    {
                        role: "system",
                        content: channelOptions.aiSystemContext,
                    },
                    ...channelMessages,
                ]).then((response) => {
                    console.log(chalk.bold.greenBright(`[${channel}] GoosyAI: ${response}`));
                    if (!response) return;

                    const messagePrefix = channelOptions.tts ? "" : "! ";
                    const messageContent = response.replace(/^[^:]+:\s*/, "");
                    const message = `${messagePrefix}${messageContent}`;
                    this.client.say(channel, message);

                    if (!taggingAllow) {
                        this.messagesIndex++;
                    }
                });
            }
        });
    }
}