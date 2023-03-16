import { Configuration, OpenAIApi } from "openai";
import Bottleneck from "bottleneck";
import chalk from "chalk";

export default class ChatAI {
    constructor(options = {}) {
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(this.configuration);
        this.options = {
            model: "gpt-3.5-turbo",
            frequency: 1000, // milliseconds
            ...options
        };
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: this.options.frequency
        });
    }

    generateMessage(messages) {
        console.log(chalk.blueBright(`THINKING...`));
        return this.limiter.schedule(() => {
            return this.openai.createChatCompletion({
                model: this.options.model,
                messages: messages,
            })
                .then((response) => {
                    console.log(chalk.blueBright(`OpenAI API usage:`, response.data.usage));
                    return response.data.choices[0].message?.content?.trim?.() ?? null;
                })
                .catch((error) => {
                    console.log(chalk.redBright(`OpenAI API error: ${error}`));
                    return null;
                });
        });
    }
}
