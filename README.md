# WhatsApp Assistant Bot 🤖

A sophisticated WhatsApp bot powered by Google's Gemini AI that acts as my personal assistant. The bot can handle individual conversations, track group statistics, document group "lore", share files, send stickers, and more!

## About the Project

Managing multiple WhatsApp conversations and staying on top of group dynamics can be overwhelming, especially when juggling academic life, work, and social interactions. This WhatsApp Assistant Bot was created to solve the common problem of missing important messages, losing track of group conversations, and the tedious task of manually sharing files with friends and colleagues. 

The bot serves as an intelligent intermediary that can handle routine tasks like sharing study materials, tracking group activity patterns, and most uniquely - automatically documenting the "lore" or important moments in group chats that often get lost in the constant stream of messages. Whether it's remembering who said what during an important discussion, keeping track of inside jokes, or simply providing quick access to shared resources, this assistant ensures nothing important slips through the cracks while maintaining the casual, friendly vibe that makes WhatsApp conversations enjoyable.

## Features

### AI-Powered Conversations
- **Gemini 2.0 Flash Integration**: Natural conversations with Google's latest AI model
- **Contextual Memory**: Maintains conversation history for each user
- **Personality**: Sarcastic, tech-savvy student vibe with casual, unfiltered responses
- **Smart Responses**: JSON-based action system for complex interactions

### Group Analytics
- **Message Statistics**: Tracks total messages and per-member stats
- **Auto-Reset**: Weekly statistics reset with backup creation
- **Top Contributors**: `/stats` command shows top 5 most active members
- **Real-time Updates**: Live statistics tracking

### Group Lore Documentation
- **Automatic Lore Creation**: Documents important group conversations
- **Smart Triggers**: Creates lore summaries after every 3 messages (configurable)
- **Narrative Style**: AI-generated storytelling of group events and inside jokes
- **File Storage**: Saves lore as timestamped text files

### File Sharing System
- **Dynamic File Access**: Can list and share files from the `files_to_share` directory
- **Smart File Discovery**: AI determines which files to share based on user requests
- **Multiple File Support**: Can send multiple files in a single response

### Sticker Support
- **Sticker Library**: Curated collection of reaction stickers
- **Context-Aware**: AI chooses appropriate stickers for conversations
- **CSV Management**: Sticker metadata managed via CSV file

### Conversation Management
- **Ignore System**: Users can ignore/unignore the bot with commands
- **Hard Ignore**: Permanent ignore for persistent users
- **Selective Responses**: Bot intelligently chooses when to respond

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Google Gemini API key
- WhatsApp account for bot session

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WhatsappAssistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Gemini API key**
   - Edit `GeminiHandler.js` and replace the API key with your own
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Configure the bot personality**
   - Create `assets/prompt.txt` for custom personality (private)
   - Or use the default `assets/public_prompt.txt`

5. **Add files to share**
   - Place files you want the bot to share in the `files_to_share/` directory

6. **Add stickers**
   - Place sticker images in the `stickers/` directory
   - Update `assets/stickers.csv` with sticker metadata

7. **Run the bot**
   ```bash
   node main.js
   ```

8. **First-time setup**
   - A browser window will open for WhatsApp Web
   - Scan the QR code with your WhatsApp
   - The bot session will be saved for future use

## Usage

### Individual Conversations
- Simply message the bot directly
- Use `!ignore` or `/ignore` to stop the bot from responding
- Use `!unignore` or `/unignore` to re-enable responses

### Group Features
- **Statistics**: Send `/stats` in a group to see message statistics
- **Auto-Lore**: The bot automatically documents interesting group conversations
- **File Requests**: Ask the bot for specific files (e.g., "Can you send me the workshop notes?")

### Bot Commands
| Command | Description |
|---------|-------------|
| `/stats` | Show group message statistics |
| `!ignore` / `/ignore` | Stop bot responses |
| `!unignore` / `/unignore` | Re-enable bot responses |

## Configuration

### Main Configuration (`main.js`)
```javascript
const loreMsgsNo = 3;        // Messages before documenting lore
const statsUpdateMsgs = 1;   // Messages before updating stats
const statsResetDays = 7;    // Days before resetting stats
```

### File Structure
```
WhatsappAssistant/
├── main.js                 # Main bot logic
├── GeminiHandler.js        # AI integration
├── tools.js               # Utility functions
├── package.json           # Dependencies
├── assets/
│   ├── prompt.txt         # Custom bot personality (create this)
│   ├── public_prompt.txt  # Default personality
│   └── stickers.csv       # Sticker metadata
├── files_to_share/        # Files bot can share
├── stickers/             # Sticker images
├── group_lores/          # Generated group lore files
├── group_stats/          # Group statistics
└── tokens/               # WhatsApp session data
```

## Dependencies

- **venom-bot**: WhatsApp Web automation
- **@google/genai**: Google Gemini AI integration
- **puppeteer**: Browser automation
- **axios**: HTTP requests
- **mime-types**: File type detection
- **qs**: Query string utilities

## Privacy & Security

- **Local Storage**: All data is stored locally
- **Session Management**: WhatsApp session is saved securely
- **API Key**: Keep your Gemini API key secure and private
- **Group Data**: Statistics and lore are stored locally only

# Demo 

https://github.com/user-attachments/assets/5b77b8ca-ddc1-4a80-9b49-106e97030b4c


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Disclaimer

This bot is for educational and personal use only. Make sure to comply with WhatsApp's Terms of Service and use responsibly. The developers are not responsible for any misuse of this software.

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if the conversation is ignored
   - Verify Gemini API key is valid
   - Check console for error messages

2. **QR Code issues**
   - Clear the `tokens/` directory and restart
   - Ensure WhatsApp Web is accessible

3. **File sharing not working**
   - Verify files exist in `files_to_share/` directory
   - Check file permissions

4. **Stickers not sending**
   - Ensure sticker files exist in `stickers/` directory
   - Verify `stickers.csv` has correct paths

---
