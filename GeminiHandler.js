import { GoogleGenAI } from "@google/genai";
import { readFile } from "./tools.js";
import fs from "fs";

const api_key = "AIzaSyDmkcDD3XI15Xf1yalmbGPVDwIcVxIoW0w";
const ai = new GoogleGenAI({
    apiKey: api_key,
})

let SysPrompt= '';

if (fs.existsSync("assets\\prompt.txt")) {
    SysPrompt = readFile("assets\\prompt.txt"); // Custom prompt file -- Overrides the public one
}
else if (fs.existsSync("assets\\public_prompt.txt")) {
    SysPrompt = readFile("assets\\public_prompt.txt");
}
else {
    throw new Error("No prompt file found! Please create either 'prompt.txt' or 'public_prompt.txt'.");
}

SysPrompt += `Available Stickers: \n ${readFile("stickers.csv")}`;

async function generateResponse(prompt){
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    })
    return response.text;
}

function createEmptyChat(){
    const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [
            {
                role: "user",
                parts: [
                    {
                        text: SysPrompt,
                    }
                ]
            }
        ],
    })
    return chat;
}

async function chatWithAI(chat, message) {
    const response = await chat.sendMessage({message:message});
    return response.text;
}


async function testAgents(){
    const chat = createEmptyChat();
    const response = await chatWithAI(chat, "Hello, who are you?");
    console.log("Response:", response);
    const response2 = await chatWithAI(chat, "Can you send me your workshop notes?");
    const response3 = await chatWithAI(chat, response2);
    console.log(response2);
}

testAgents()

export {generateResponse, createEmptyChat, chatWithAI};