import venom from 'venom-bot';
import {generateResponse, createEmptyChat, chatWithAI} from './GeminiHandler.js';


const chattingWithIDs = new Set();
const IDChats = new Map();

venom.create({
    session: 'hzs-test-bot',
    headless: false,

})
.then((client) => start(client))
.catch((error) => {
    console.error('Error creating Venom client:', error);
});

const start = (client) => {
    console.log('Client created successfully!');

    client.onMessage((message) => {
        if (!message.body || message.body.trim() === '') return;

        const trimmedBody = message.body.trim();

        if (trimmedBody.startsWith('/startAiChat')) {
            client.sendText(message.from, "You are now chatting with Huzaifa's AI assistant!");
            chattingWithIDs.add(message.from);
            console.log(`[AI START] Chat started with ${message.sender.pushname} (${message.shortName})`);
            IDChats.set(message.from, createEmptyChat());
        }

        else if (trimmedBody.startsWith('/endAiChat')) {
            client.sendText(message.from, "You have ended the AI chat.");
            chattingWithIDs.delete(message.from);
            console.log(`[AI END] Chat ended with ${message.sender.pushname} (${message.shortName})`);
            IDChats.delete(message.from);
        }

        else if (trimmedBody.startsWith('/AIrespond')) {
            const response = generateResponse(trimmedBody);
            console.log(`[AI COMMAND] /AIrespond triggered`);
            Promise.resolve(response).then((res) => {
                client.sendText(message.from, res);
            });
        }

        else if (trimmedBody.startsWith('/help')) {
            const helpMessage = 
                `Available Commands:
                \n/startAiChat - Start chatting with Huzaifa's AI assistant.
                \n/endAiChat - End the AI chat session.
                \n/AIrespond - Send a single message to the assistant and get a reply.
                \n/help - Show this help message.`;
            client.sendText(message.from, helpMessage);
        }

        else if (chattingWithIDs.has(message.from)) {
            console.log(`[AI MSG] ${message.sender.pushname} (${message.shortName}): ${trimmedBody}`);
            const inputMessage = `Message From ${message.sender.pushname} - (${message.shortName}): ${trimmedBody}`;
            const chat = IDChats.get(message.from);
            const response = chatWithAI(chat, inputMessage);
            Promise.resolve(response).then((res) => {
                client.sendText(message.from, res);
            });
        }
    });

}
