import venom from 'venom-bot';
import { GeminiHandler } from './GeminiHandler.js';
import { listDir, readFile, loadGroupStats } from './tools.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function startBot(config) {
    console.log(chalk.blue('🤖 Initializing WhatsApp Assistant...'));
    
    // Initialize Gemini handler
    const geminiHandler = new GeminiHandler(config.apiKey, config.assetsPath || './assets');
    
    // Configuration variables from config
    const loreMsgsNo = config.loreMsgsNo || 3;
    const statsUpdateMsgs = config.statsUpdateMsgs || 1;
    const statsResetDays = config.statsResetDays || 7;
    const sessionName = config.sessionName || 'whatsapp-assistant';
    const headless = config.headless !== undefined ? config.headless : false;

    const returnLorePrompt = (groupName, compiledMsgs) => {
        const lorePrompt = `
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
        `;
        return lorePrompt;
    };

    const AIChats = new Object();
    const IgnoredConvos = new Set();
    const groupMsgs = new Object();
    const loreCount = new Object();
    let stats = [];
    const statsObj = new Object();

    try {
        const client = await venom.create({
            session: sessionName,
            headless: headless,
        });

        console.log(chalk.green('✅ WhatsApp client created successfully!'));
        
        // Load existing stats
        const statsPath = './group_stats/group_stats.json';
        stats = loadGroupStats(statsPath);

        for (let stat of stats) {
            const groupName = stat.group_name;
            if (new Date(stat.lastReset) < new Date(Date.now() - 24 * 60 * 60 * 1000 * statsResetDays)) {
                // Resetting stats every configured days
                const timestamp = new Date().toString().replace(/[:]/g, '-'); // replace ':' to avoid file errors
                const fileName = `${groupName}-${timestamp}-reset-backup.json`;
                const backupPath = path.join('./group_stats/Backup', fileName);
                fs.writeFileSync(backupPath, JSON.stringify(stat));
                console.log(chalk.yellow(`📊 Resetting stats for group ${groupName}...`));
                stat.totalMessages = 0;
                stat.memberStats = {};
                stat.lastReset = new Date().toISOString();
            }
            statsObj[groupName] = stat;
        }
        
        let statsUpdates = 0; // To update stats every X messages

        client.onMessage(async (message) => {
            if (!message.body || message.body.trim() == '') return;
            let response;
            let chat;
            
            if (message.isGroupMsg === true) {
                console.log(chalk.cyan(`📱 Group message from ${message.groupInfo.name}: ${message.body.substring(0, 50)}...`));
                
                const groupName = message.groupInfo.name;
                const senderName = message.sender.name !== '' ? message.sender.name : message.sender.pushname;

                if (!statsObj.hasOwnProperty(groupName)) {
                    console.log(chalk.blue(`📊 Creating new stats entry for group: ${groupName}`));
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

                if (statsUpdates >= statsUpdateMsgs) {
                    console.log(chalk.blue("📊 Updating stats file..."));
                    stats = [];
                    statsUpdates = 0;
                    for (let group of Object.entries(statsObj)) {
                        const groupStat = group[1];
                        stats.push(groupStat);
                    }
                    fs.writeFileSync(statsPath, JSON.stringify(stats));
                }

                if (message.body.trim().startsWith("/stats")) {
                    let statsMessage = `Stats for ${groupName}\\n\\nLast Reset: ${new Date(statsObj[groupName].lastReset).toLocaleString()}\\nTotal Messages: ${statsObj[groupName].totalMessages}\\n\\nMember Stats:\\n`;

                    let memberStats = statsObj[groupName].memberStats;

                    const top5 = Object.entries(memberStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => `${name}: ${count} messages\\n`);

                    statsMessage += top5.join('');
                    await client.sendText(message.groupInfo.id, statsMessage);
                }

                if (!groupMsgs.hasOwnProperty(groupName) || !loreCount.hasOwnProperty(groupName)) {
                    groupMsgs[groupName] = [];
                    loreCount[groupName] = 1;
                }

                if (message.body.trim() !== "") {
                    groupMsgs[groupName].push({
                        sender: senderName,
                        body: message.body.trim(),
                        timestamp: new Date(message.timestamp * 1000).toISOString()
                    });
                }

                if (groupMsgs[groupName].length > (loreCount[groupName] * loreMsgsNo)) {
                    console.log(chalk.magenta(`📖 Documenting lore for group ${groupName}...`));
                    let compiledMsgs = "";
                    for (let msg of groupMsgs[groupName]) {
                        compiledMsgs += `${msg.sender}: ${msg.body}\\n - Sent At: ${msg.timestamp}\\n`;
                    }

                    const response = await geminiHandler.generateResponse(returnLorePrompt(groupName, compiledMsgs));
                    const loreFileName = `lore_${groupName}[1-${loreCount[groupName] * loreMsgsNo}].txt`;
                    fs.writeFileSync(path.join('./group_lores', loreFileName), response, 'utf8');
                    loreCount[groupName] += 1;
                    console.log(chalk.green(`📖 Lore documented: ${loreFileName}`));
                }

                return;
            }

            // Handle private messages
            const trimmedBody = message.body.trim();

            if (trimmedBody === "!ignore" || trimmedBody === "/ignore") {
                IgnoredConvos.add(message.from);
                await client.sendText(message.from, "You have been ignored. I won't respond to your messages anymore.");
                console.log(chalk.yellow(`🔇 Ignored conversation: ${message.sender.name}`));
            }
            else if (trimmedBody === "!unignore" || trimmedBody === "/unignore") {
                IgnoredConvos.delete(message.from);
                await client.sendText(message.from, "You have been unignored. I will respond to your messages again.");
                console.log(chalk.green(`🔊 Unignored conversation: ${message.sender.name}`));
            }

            if (IgnoredConvos.has(message.from)) {
                return;
            }

            console.log(chalk.cyan(`💬 Private message from ${message.sender.name}: ${message.body.substring(0, 50)}...`));

            if (AIChats.hasOwnProperty(message.from)) {
                chat = AIChats[message.from];
                response = await geminiHandler.chatWithAI(chat, trimmedBody);
            }
            else {
                chat = geminiHandler.createEmptyChat();
                AIChats[message.from] = chat;
                const firstMsg = `You are now chatting with ${message.sender.name}. \\n ${trimmedBody}`;
                response = await geminiHandler.chatWithAI(chat, firstMsg);
            }

            response = response.replace("```json\\n", "").replace("```", "");

            console.log(chalk.blue("🤖 AI Response processed"));
            console.log(response);
            let jsonResponse = JSON.parse(response);
            let returned = false;

            while (!returned) {
                let breakLoop = false;
                for (let resps of jsonResponse) {
                    let action = resps.action;
                    if (breakLoop) break;
                    switch (action) {
                        case "share_file":
                            resps.file_paths.forEach(async (file_path) => {
                                await client.sendFile(
                                    message.from,
                                    file_path,
                                    file_path.split('/').pop(),
                                    ""
                                );
                            });
                            returned = true;
                            break;

                        case "get_file_paths":
                            const filePaths = listDir("./files_to_share");
                            chat = AIChats[message.from];
                            response = await geminiHandler.chatWithAI(chat, `Here are the files you can share:\\n${filePaths.join('\\n')}`);
                            response = response.replace("```json\\n", "").replace("```", "");
                            jsonResponse = JSON.parse(response);
                            breakLoop = true;
                            returned = false;
                            break;

                        case "answer":
                            response = resps.answer;
                            await client.sendText(message.from, response)
                                .then(() => {
                                    console.log(chalk.green('✅ Message sent successfully!'));
                                })
                                .catch((error) => {
                                    console.error(chalk.red('❌ Error sending message:'), error);
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
                            if (resps.sticker_path) {
                                await client.sendImageAsSticker(
                                    message.from,
                                    resps.sticker_path
                                )
                                    .then(() => {
                                        console.log(chalk.green('✅ Sticker sent successfully!'));
                                    })
                                    .catch((error) => {
                                        console.log(chalk.red("❌ Error sending sticker: "), error);
                                    });
                            }
                            returned = true;
                            break;
                            
                        case "get_available_stickers":
                            const stickersPath = path.join('./assets', 'stickers.csv');
                            const data = readFile(stickersPath);
                            chat = AIChats[message.from];
                            response = await geminiHandler.chatWithAI(chat, `Here are the available stickers:\\n${data}`);
                            response = response.replace("```json\\n", "").replace("```", "");
                            jsonResponse = JSON.parse(response);
                            breakLoop = true;
                            returned = false;
                            break;
                    }
                }
            }
        });

        console.log(chalk.green('🚀 WhatsApp Assistant is now running!'));
        console.log(chalk.yellow('Press Ctrl+C to stop the bot'));

    } catch (error) {
        console.error(chalk.red('❌ Error creating Venom client:'), error);
        throw error;
    }
}
