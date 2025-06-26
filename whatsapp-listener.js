import venom from 'venom-bot';
import {generateResponse, createEmptyChat, chatWithAI} from './GeminiHandler.js';
import { listDir } from './tools.js';

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
        if (!message.body || message.body.trim() == '' || IgnoredConvos.has(message.from)) return;

        const trimmedBody = message.body.trim();
        let response;
        if (AIChats.hasOwnProperty(message.from)) {
            const chat = AIChats[message.from];
            response = await chatWithAI(chat, trimmedBody);
        }
        else {
            const chat = createEmptyChat();
            AIChats[message.from] = chat;
            const firstMsg = `You are now chatting with ${message.sender.name}. \n ${trimmedBody}`;
            response = await chatWithAI(chat, firstMsg);
        }

        console.log("Response:", response);

        response = response.replace("```json\n", "").replace("```", "");

        console.log("Response after formatting:", response);

        let jsonResponse = JSON.parse(response);
        let action = jsonResponse.action;
        let returned = false;
        while (!returned){
            switch (action){
                case "share_file":
                    jsonResponse.file_paths.forEach(async (file_path)=>{
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
                    const chat = AIChats[message.from];
                    response = await chatWithAI(chat, `Here are the files you can share:\n${filePaths.join('\n')}`);
                    response = response.replace("```json\n", "").replace("```", "");
                    jsonResponse = JSON.parse(response);
                    action = jsonResponse.action;
                    break;

                case "answer":
                    response = jsonResponse.answer;
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
            }
        }
    });

}
