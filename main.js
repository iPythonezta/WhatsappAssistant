import venom from 'venom-bot';
import {generateResponse, createEmptyChat, chatWithAI} from './GeminiHandler.js';
import { listDir, readFile, loadGroupStats } from './tools.js';
import fs from 'fs';

venom.create({
    session: 'hzs-test-bot',
    headless: false,

})
.then((client) => start(client))
.catch((error) => {
    console.error('Error creating Venom client:', error);
});

// ------------------------------------------------------------ Config Varaible Start ------------------------------------------------------------ //


const loreMsgsNo = 3 // Will document the lore after this no of msg have been sent to the group

const returnLorePrompt = (groupName, compiledMsgs) => {

        const lorePrompt =  `
            You are Huzaifa's personal assistant. Huzaifa is part of several active and chaotic WhatsApp groups, each with its own inside jokes, events, and drama. He often struggles to keep up with the context and ongoing "lore" of these groups.
        
            Your task is to analyze the messages from the group "${groupName}" and write a detailed Group Lore Summary. This summary should:
        
            - Capture all important events, jokes, or turning points in the conversation.
            - Include exact quotes of any iconic or noteworthy messages.
            - Highlight any funny, dramatic, or recurring themes.
            - Mention key people involved and how the conversation evolved.
            - Feel like a retelling of a story that someone who missed the group could read to get fully caught up.
            - Story should be written in a narrative style, without much reflection from your side, must not contain any
            headings or subheadings, and should be written in a way that it feels like a story. Just 2-3 paragraphs at max.


            Here are the group messages:
            ${compiledMsgs}
        `
        return lorePrompt;
}

const statsUpdateMsgs = 1; // How many messages before updating stats file
const statsResetDays = 7; // How many days before resetting stats

// ------------------------------------------------------------ Config Varaible End ------------------------------------------------------------ //

const AIChats = new Object();
const IgnoredConvos = new Set();

const groupMsgs = new Object();
const loreCount = new Object();

let stats = [];
const statsObj = new Object();

const start = (client) => {
    console.log('Client created successfully!');
    
    stats = loadGroupStats("group_stats/group_stats.json");

    for (let stat of stats) {
        const groupName = stat.group_name;
        if (new Date(stat.lastReset) < new Date(Date.now() - 24 * 60 * 60 * statsResetDays)){
            // Resetting stats every week
            const timestamp = new Date().toString().replace(/[:]/g, '-'); // replace ':' to avoid file errors
            const fileName = `${groupName}-${timestamp}-reset-backup.json`;
            fs.writeFileSync(`group_stats/Backup/${fileName}`, JSON.stringify(stat));
            console.log(`Resetting stats for group ${groupName}...`);
            stat.totalMessages = 0;
            stat.memberStats = {};
            stat.lastReset = new Date().toISOString();
        }
        statsObj[groupName] = stat;
    }
    
    let statsUpdates = 0; // To update stats every X messages

    client.onMessage(async (message) => {
        if (!message.body || message.body.trim() == '' ) return;
        let response;
        let chat;
        if (message.isGroupMsg === true){

            console.log(message);
            console.log("Group message received:", message.body);
            console.log("Group Name:", message.groupInfo.name);
            const groupName = message.groupInfo.name;
            const senderName = message.sender.name !== '' ? message.sender.name : message.sender.pushname;

            if (!statsObj.hasOwnProperty(groupName)){
                console.log(`Group ${groupName} not found in stats, creating new entry...`);
                statsObj[groupName] = {
                    group_name: groupName,
                    totalMessages: 0,
                    memberStats: {},
                    lastReset: new Date().toISOString(),
                };
            }

            statsObj[groupName].totalMessages += 1;
            statsObj[groupName].memberStats[senderName] = (statsObj[groupName].memberStats[senderName] || 0) + 1;
            statsUpdates += 1;

            if (statsUpdates >= statsUpdateMsgs){
                console.log("Updating stats file... ");
                stats = []
                statsUpdates = 0;
                for (let group of Object.entries(statsObj)){
                    const groupStat = group[1];
                    stats.push(groupStat);
                }
                fs.writeFileSync("group_stats/group_stats.json", JSON.stringify(stats));
            }

            if (message.body.trim().startsWith("/stats")) {
                
                let statsMessage = `Stats for ${groupName}\n\nLast Reset: ${new Date(statsObj[groupName].lastReset).toLocaleString()}\nTotal Messages: ${statsObj[groupName].totalMessages}\n\nMember Stats:\n`;

                let memberStats = statsObj[groupName].memberStats;

                const top5 = Object.entries(memberStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => `${name}: ${count} messages\n`);

                statsMessage += top5.join('');
                await client.sendText(message.groupInfo.id, statsMessage)
            }

            if (!groupMsgs.hasOwnProperty(groupName) || !loreCount.hasOwnProperty(groupName)){
                groupMsgs[groupName] = [];
                loreCount[groupName] = 1;
            }

            if (message.body.trim() !== ""){
                groupMsgs[groupName].push({
                    sender: senderName,
                    body: message.body.trim(),
                    timestamp: new Date(message.timestamp * 1000).toISOString()
                })
            }

            if (groupMsgs[groupName].length > (loreCount[groupName] * loreMsgsNo)) {
                console.log(`Group ${groupName} has more than ${loreMsgsNo} messages, Documenting lore...`);
                let compiledMsgs = "";
                for (let msg of groupMsgs[groupName]){
                    compiledMsgs += `${msg.sender}: ${msg.body}\n - Sent At: ${msg.timestamp}\n`
                }
                

                const response = await generateResponse(returnLorePrompt(groupName, compiledMsgs));
                fs.writeFileSync(`group_lores/lore_${groupName}[1-${loreCount[groupName] * 30}].txt`, response, 'utf8');
                loreCount[groupName] += 1;
            }

            return;
        }

        const trimmedBody = message.body.trim();

        if (trimmedBody === "!ignore" || trimmedBody === "/ignore"){
            IgnoredConvos.add(message.from);
            await client.sendText(message.from, "You have been ignored. I won't respond to your messages anymore.");
        }

        else if (trimmedBody === "!unignore" || trimmedBody === "/unignore"){
            IgnoredConvos.delete(message.from);
            await client.sendText(message.from, "You have been unignored. I will respond to your messages again.");
        }

        if (IgnoredConvos.has(message.from)) {
            return;
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
                        const data = readFile("assets\\stickers.csv");
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
