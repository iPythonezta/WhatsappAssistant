import venom from 'venom-bot';
import {generateResponse, createEmptyChat, chatWithAI} from './GeminiHandler.js';
import { listDir, readFile } from './tools.js';

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

const start = (client) => {
    console.log('Client created successfully!');

    client.onMessage(async (message) => {
        if (!message.body || message.body.trim() == '' || IgnoredConvos.has(message.from) || message.isGroupMsg === true) return;

        const trimmedBody = message.body.trim();
        let response;
        let chat;
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
                        delete AIChats[message.from];
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
