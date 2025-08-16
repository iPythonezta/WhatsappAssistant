import { GoogleGenAI } from "@google/genai";
import { readFile } from "./tools.js";
import fs from "fs";
import path from "path";

class GeminiHandler {
    constructor(apiKey, assetsPath = "./assets") {
        this.ai = new GoogleGenAI({
            apiKey: apiKey,
        });
        this.assetsPath = assetsPath;
        this.sysPrompt = this.loadPrompt();
    }

    loadPrompt() {
        let prompt = '';
        
        const customPromptPath = path.join(this.assetsPath, "prompt.txt");
        const publicPromptPath = path.join(this.assetsPath, "public_prompt.txt");
        
        if (fs.existsSync(customPromptPath)) {
            prompt = readFile(customPromptPath); // Custom prompt file -- Overrides the public one
        }
        else if (fs.existsSync(publicPromptPath)) {
            prompt = readFile(publicPromptPath);
        }
        else {
            throw new Error("No prompt file found! Please create either 'prompt.txt' or 'public_prompt.txt' in the assets folder.");
        }

        const stickersPath = path.join(this.assetsPath, "stickers.csv");
        if (fs.existsSync(stickersPath)) {
            prompt += `\\nAvailable Stickers: \\n ${readFile(stickersPath)}`;
        }

        return prompt;
    }

    async generateResponse(prompt) {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        return response.text;
    }

    createEmptyChat() {
        const chat = this.ai.chats.create({
            model: "gemini-2.0-flash",
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: this.sysPrompt,
                        }
                    ]
                }
            ],
        });
        return chat;
    }

    async chatWithAI(chat, message) {
        const response = await chat.sendMessage({ message: message });
        return response.text;
    }
}

export { GeminiHandler };
