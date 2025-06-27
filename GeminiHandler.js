import { GoogleGenAI } from "@google/genai";
import { readFile } from "./tools.js";

const api_key = "AIzaSyDmkcDD3XI15Xf1yalmbGPVDwIcVxIoW0w";
const ai = new GoogleGenAI({
    apiKey: api_key,
})

let SysPrompt = readFile("prompt.txt");
SysPrompt += `Available Stickers: \n ${readFile("stickers.csv")}`;

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