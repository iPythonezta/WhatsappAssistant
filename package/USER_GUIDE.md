# WhatsApp AI Assistant Bot 🤖

Transform your WhatsApp into an intelligent assistant! This AI-powered bot helps manage conversations, track group statistics, document memorable moments, share files, and provide smart responses using Google's Gemini AI.

## Quick Start

### Step 1: Install the Bot
```bash
npm install -g whatsapp-ai-assistant
```

### Step 2: Create Your Bot Project
```bash
whatsapp-assistant init my-whatsapp-bot
cd my-whatsapp-bot
```

### Step 3: Get Your AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 4: Configure Your Bot
```bash
whatsapp-assistant config
```
Follow the prompts to enter your API key and preferences.

### Step 5: Start Your Bot
```bash
whatsapp-assistant start
```

A browser window will open. Scan the QR code with your WhatsApp to connect!

## What Your Bot Can Do

### Smart Conversations
- **Natural AI Responses**: Powered by Google Gemini AI
- **Context Memory**: Remembers your conversation history
- **Personality**: Configurable personality through prompts
- **Multiple Users**: Handles conversations with different people simultaneously

### Group Analytics
- **Message Tracking**: Counts messages per group and member
- **Statistics Command**: Use `/stats` in any group to see activity
- **Top Contributors**: Shows who's most active in the group
- **Auto Reset**: Weekly stats reset with backup creation

### Lore Documentation
- **Auto-Summarization**: Documents important group conversations
- **Story Format**: Creates narrative summaries of group events
- **Inside Jokes**: Captures and remembers group humor
- **Timestamped**: All lore files are dated and organized

### File Sharing
- **Smart Sharing**: Ask the bot for files and it finds them
- **Multiple Formats**: Supports any file type
- **Easy Management**: Just drop files in the `files_to_share` folder

### Sticker Reactions
- **Context-Aware**: Sends appropriate stickers based on conversation
- **Custom Library**: Add your own stickers
- **Emotion Detection**: AI chooses stickers that match the mood

### Conversation Control
- **Ignore/Unignore**: Users can control bot responses
- **Privacy Respect**: Bot won't spam unwanted responses
- **Group-Specific**: Different behavior in groups vs private chats

## How to Use

### Private Messages
Simply message your bot directly:

**User:** "Hey, how are you?"  
**Bot:** "I'm doing great! How can I help you today?"

**User:** "Can you send me the meeting notes?"  
**Bot:** *[Searches files and sends the document]*

**User:** "!ignore"  
**Bot:** "You have been ignored. I won't respond anymore."

### Group Chats
Add your bot to any group:

**Anyone:** "/stats"  
**Bot:** Shows message statistics for the group

The bot will automatically:
- Track who sends the most messages
- Document interesting conversations as "lore"
- Respond to @mentions or direct questions

### Commands Reference

| Command | Where | What it does |
|---------|-------|-------------|
| `/stats` | Groups | Shows group message statistics |
| `!ignore` or `/ignore` | Private | Bot stops responding to you |
| `!unignore` or `/unignore` | Private | Bot starts responding again |

## Customization

### Your Project Structure
```
my-whatsapp-bot/
├── config.json          # Your bot settings
├── assets/
│   ├── public_prompt.txt # Bot's personality
│   └── stickers.csv      # Available stickers
├── files_to_share/       # Put files here to share
├── stickers/            # Add custom sticker images
├── group_stats/         # Statistics data
└── group_lores/         # Conversation summaries
```

### Personalizing Your Bot

#### 1. Change the Personality
Edit `assets/public_prompt.txt` to customize how your bot talks:
```
You are a helpful assistant who loves tech and uses casual language...
```

#### 2. Add Files to Share
Drop any files in `files_to_share/`:
- Documents (PDF, DOCX, TXT)
- Images (PNG, JPG, GIF)
- Archives (ZIP, RAR)
- Code files (JS, PY, etc.)

#### 3. Add Custom Stickers
1. Put image files in `stickers/` folder
2. Update `assets/stickers.csv`:
```csv
emotion,filename,description
happy,my-happy-face.png,Smiling emoji
confused,confused-cat.jpg,Confused cat meme
```

#### 4. Adjust Settings
Edit `config.json` or run `whatsapp-assistant config`:
```json
{
  "apiKey": "your-api-key",
  "sessionName": "my-bot",
  "headless": false,
  "loreMsgsNo": 3,
  "statsUpdateMsgs": 1,
  "statsResetDays": 7
}
```

### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `apiKey` | Your Gemini AI API key | *Required* |
| `sessionName` | WhatsApp session name | "whatsapp-assistant" |
| `headless` | Hide browser window | false |
| `loreMsgsNo` | Messages before creating lore | 3 |
| `statsUpdateMsgs` | Messages before saving stats | 1 |
| `statsResetDays` | Days before resetting stats | 7 |

## Use Cases

### For Students
- **Study Groups**: Track who contributes most to discussions
- **File Sharing**: Easy access to notes, assignments, and resources
- **Conversation Memory**: Never lose important discussion points

### For Teams
- **Project Coordination**: Share documents and track communication
- **Meeting Notes**: Quick access to shared files and decisions
- **Team Dynamics**: Understand communication patterns

### For Friend Groups
- **Memory Keeper**: Document funny moments and inside jokes
- **Media Sharing**: Easy photo and meme distribution
- **Group Statistics**: See who talks the most (for fun!)

### For Families
- **Photo Sharing**: Quick access to family photos
- **Event Planning**: Share documents and coordinate
- **Stay Connected**: AI responses when you're busy

## Troubleshooting

### Bot Not Responding
1. Check if conversation is ignored: send `!unignore`
2. Verify API key in `config.json`
3. Check console output for errors
4. Restart the bot: `whatsapp-assistant start`

### QR Code Issues
1. Close WhatsApp Web on other devices
2. Delete the session and restart:
   ```bash
   whatsapp-assistant start
   ```
3. Try with `"headless": false` in config

### File Sharing Not Working
1. Check files exist in `files_to_share/` folder
2. Verify file permissions (readable)
3. Try asking specifically: "Send me [filename]"

### API Errors
1. Verify your Gemini API key is valid
2. Check your Google AI Studio quota
3. Ensure you have internet connection

### Performance Issues
1. Reduce `loreMsgsNo` if lore creation is slow
2. Increase `statsUpdateMsgs` to save stats less frequently
3. Clean up old lore files periodically

## Privacy & Security

### Your Data
- **Local Storage**: All data stays on your computer
- **No Cloud Sync**: Statistics and lore files are private
- **Session Security**: WhatsApp session is encrypted locally

### API Usage
- **Gemini AI**: Only sends message content for AI responses
- **No Personal Data**: Phone numbers and contacts stay private
- **Rate Limits**: Respects Google's API usage limits

### Best Practices
- Keep your API key secret
- Don't share your config.json file
- Regularly backup important lore files
- Use strong passwords for your WhatsApp account

## Updates

### Updating the Bot
```bash
npm update -g whatsapp-ai-assistant
```

### Migration
If you update and need to migrate:
1. Backup your project folder
2. Create a new project: `whatsapp-assistant init new-bot`
3. Copy your files from the old project:
   - `config.json`
   - `files_to_share/`
   - `stickers/`
   - `assets/` (if customized)

## Getting Help

### Common Questions

**Q: Can I run multiple bots?**  
A: Yes! Create different project folders with different session names.

**Q: Does this work on mobile?**  
A: No, this requires a computer to run Node.js.

**Q: Can I use this for business?**  
A: Check WhatsApp's Terms of Service for commercial use.

**Q: Is this free?**  
A: The bot is free, but Google charges for Gemini API usage after free tier.

### Support
- **Bug Reports**: [GitHub Issues](https://github.com/iPythonezta/WhatsappAssistant/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/iPythonezta/WhatsappAssistant/discussions)
- **Documentation**: This README and inline help

#  Advanced Tips

### Power User Features
1. **Multiple Personalities**: Create different prompt files for different moods
2. **Scheduled Lore**: Use task scheduler to create daily summaries
3. **File Organization**: Use subfolders in `files_to_share/` for categories
4. **Custom Triggers**: Modify the code to add custom commands

### Performance Optimization
1. **Headless Mode**: Set `"headless": true` for server deployment
2. **Reduced Logging**: Minimize console output for better performance
3. **Cleanup Scripts**: Regularly archive old lore and stats files

### Integration Ideas
1. **Backup Sync**: Use cloud storage for automatic file backup
2. **Analytics**: Export stats to spreadsheets for analysis
3. **Webhooks**: Connect to other services via custom modifications

---

## Enjoy Your AI Assistant!

Your WhatsApp is now supercharged with AI! Watch as your bot learns your patterns, helps manage your conversations, and becomes an indispensable part of your digital life.

**Happy chatting!** 
