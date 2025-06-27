import venom from 'venom-bot';
import {generateResponse, createEmptyChat, chatWithAI} from './GeminiHandler.js';
import { listDir, readFile } from './tools.js';
import fs from 'fs';

venom.create({
    session: 'hzs-test-bot',
    headless: false,

})
.then((client) => start(client))
.catch((error) => {
    console.error('Error creating Venom client:', error);
});

const AIChats = new Object();
const IgnoredConvos = new Set();

const groupMsgs = new Object();
const loreCount = new Object();

const start = (client) => {
    console.log('Client created successfully!');

    client.onMessage(async (message) => {
        if (!message.body || message.body.trim() == '' || IgnoredConvos.has(message.from)) return;
        let response;
        let chat;
        if (message.isGroupMsg === true){

            console.log(message);
            console.log("Group message received:", message.body);
            console.log("Group Name:", message.groupInfo.name);
            const groupName = message.groupInfo.name;
            const senderName = message.sender.name !== '' ? message.sender.name : message.sender.pushname;

            if (!groupMsgs.hasOwnProperty(groupName) || !loreCount.hasOwnProperty(groupName)){
                groupMsgs[groupName] = [];
                loreCount[groupName] = 1;
            }

            if (message.body.trim() !== ""){
                groupMsgs[groupName].push({
                    sender: senderName,
                    body: message.body.trim(),
                    timestamp: message.timestamp
                })
            }

            if (groupMsgs[groupName].length > (loreCount[groupName] * 10)){
                console.log(`Group ${groupName} has more than 10 messages, Documenting lore...`);
                let compiledMsgs = "";
                for (let msg of groupMsgs[groupName]){
                    compiledMsgs += `${msg.sender}: ${msg.body}\n - Sent At: ${msg.timestamp}\n`
                }
                const prompt =  `
                   You are Huzaifa's personal assistant. Huzaifa is part of several active and chaotic WhatsApp groups, each with its own inside jokes, events, and drama. He often struggles to keep up with the context and ongoing "lore" of these groups.

                    Your task is to analyze the messages from the group "${groupName}" and write a detailed Group Lore Summary. This summary should:

                    - Capture all important events, jokes, or turning points in the conversation.
                    - Include exact quotes of any iconic or noteworthy messages.
                    - Highlight any funny, dramatic, or recurring themes.
                    - Mention key people involved and how the conversation evolved.
                    - Feel like a retelling of a story that someone who missed the group could read to get fully caught up.

                    Here are the group messages:
                    ${compiledMsgs}
                `

                const response = await generateResponse(prompt);
                fs.writeFileSync(`group_lores/lore_${groupName}[1-${loreCount[groupName] * 30}].txt`, response, 'utf8');
                loreCount[groupName] += 1;
            }

            return;
        }

        const trimmedBody = message.body.trim();

        if (trimmedBody === "!ignore" || trimmedBody === "/ignore"){
            IgnoredConvos.add(message.from);
            await client.sendText(message.from, "You have been ignored. I won't respond to your messages anymore.");
            console.log(`Conversation with ${message.from} has been ignored.`);
        }

        else if (trimmedBody === "!unignore" || trimmedBody === "/unignore"){
            IgnoredConvos.delete(message.from);
            await client.sendText(message.from, "You have been unignored. I will respond to your messages again.");
            console.log(`Conversation with ${message.from} has been unignored.`);
        }

        if (AIChats.hasOwnProperty(message.from)) {
            chat = AIChats[message.from];
            response = await chatWithAI(chat, trimmedBody);
        }
        
        else {
            chat = createEmptyChat();
            AIChats[message.from] = chat;
            const firstMsg = `You are now chatting with ${message.sender.name}. \n ${trimmedBody}`;
            response = await chatWithAI(chat, firstMsg);
        }

        console.log("Response:", response);

        response = response.replace("```json\n", "").replace("```", "");

        console.log("Response after formatting:", response);

        let jsonResponse = JSON.parse(response);
        let returned = false;

        while (!returned){
            let breakLoop = false;
            for (let resps of jsonResponse){
                let action = resps.action;
                if (breakLoop) break;
                switch (action){
                    case "share_file":
                        resps.file_paths.forEach(async (file_path)=>{
                            await client.sendFile(
                                message.from,
                                file_path,
                                file_path.split('/').pop(),
                                ""
                            )
                        })
    
                        returned = true;
                        break;
    
                    case "get_file_paths":
                        const filePaths = listDir("files_to_share");
                        chat = AIChats[message.from];
                        response = await chatWithAI(chat, `Here are the files you can share:\n${filePaths.join('\n')}`);
                        response = response.replace("```json\n", "").replace("```", "");
                        jsonResponse = JSON.parse(response);
                        breakLoop = true;
                        returned = false;
                        break;
    
                    case "answer":
                        response = resps.answer;
                        await client.sendText(message.from, response)
                            .then(() => {
                                console.log('Message sent successfully!');
                            })
                            .catch((error) => {
                                console.error('Error sending message:', error);
                            });
                        returned = true;
                        break;
    
                    case "ignore_convo":
                        returned = true;
                        break;
    
                    case "ignore_convo_hard":
                        IgnoredConvos.add(message.from);
                        await client.sendText(message.from, `
                            The assistant has permanently ignored this conversation.
                            It will not respond to any future messages from you.
                            If you want it to unignore, send "!unignore" or "/unignore".
                        `);
                        returned = true;
                        break;
    
                    case "share_sticker":
                        if (resps.sticker_path){
                            await client.sendImageAsSticker (
                                message.from,
                                resps.sticker_path
                            )
                            .then(() => {
                                console.log('Sticker sent successfully!');
                            })
                            .catch((error)=>{
                                console.log("Error sending sticker: ", error);
                            })
                        }
                        returned = true;
                        break;
                    case  "get_available_stickers":
                        const data = readFile("stickers.csv");
                        chat = AIChats[message.from];
                        response = await chatWithAI(chat, `Here are the available stickers:\n${data}`);
                        response = response.replace("```json\n", "").replace("```", "");
                        jsonResponse = JSON.parse(response);
                        action = jsonResponse.action;
                        breakLoop = true;
                        returned = false;
                        break;
                }
            }
        }

    });

}
