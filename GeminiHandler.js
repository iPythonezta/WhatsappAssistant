import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const api_key = "AIzaSyDmkcDD3XI15Xf1yalmbGPVDwIcVxIoW0w";
const ai = new GoogleGenAI({
    apiKey: api_key,
})

const SysPrompt = fs.readFileSync("prompt.txt", "utf-8");
console.log(SysPrompt);

async function generateResponse(prompt){
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
            systemInstruction: SysPrompt
        }
    })
    return response.text;
}

function createEmptyChat(){
    const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [],
        config: {
            systemInstruction: SysPrompt
        }
    })
    return chat;
}

async function chatWithAI(chat, message) {
    const response = await chat.sendMessage({message:message});
    return response.text;
}

export {generateResponse, createEmptyChat, chatWithAI};