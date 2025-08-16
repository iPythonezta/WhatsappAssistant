# WhatsApp AI Assistant

An intelligent WhatsApp bot powered by Google's Gemini AI that can manage group statistics, document conversation lore, share files, send stickers, and provide AI-powered responses.

## Features

- **AI-Powered Responses**: Uses Google Gemini AI for intelligent conversations
- **Group Statistics**: Tracks message counts and member activity
- **Lore Documentation**: Automatically summarizes group conversations
- **File Sharing**: Share files from a designated directory
- **Sticker Support**: Send custom stickers based on context
- **Ignore System**: Ignore/unignore specific conversations
- **Configurable**: Easy configuration through JSON files

## Installation

```
npm install -g whatsapp-ai-assistant
```

## Quick Start

1. **Initialize a new bot project**:
   ```
   whatsapp-assistant init my-bot
   cd my-bot
   ```

2. **Configure your bot**:
   ```
   whatsapp-assistant config
   ```
   Or manually edit `config.json`:
   ```
   {
     "apiKey": "your-gemini-api-key-here",
     "sessionName": "my-whatsapp-bot",
     "headless": false,
     "loreMsgsNo": 3,
     "statsUpdateMsgs": 1,
     "statsResetDays": 7
   }
   ```

3. **Add your content**:
   - Place files to share in the `files_to_share/` directory
   - Add custom stickers to the `stickers/` directory
   - Customize the AI prompt in `assets/public_prompt.txt`

4. **Start your bot**:
   ```
   whatsapp-assistant start
   ```

## Configuration

### config.json Options

| Option | Description | Default |
|--------|-------------|---------|
| `apiKey` | Your Google Gemini API key | Required |
| `sessionName` | WhatsApp session name | "whatsapp-assistant" |
| `headless` | Run browser in headless mode | false |
| `loreMsgsNo` | Messages before documenting lore | 3 |
| `statsUpdateMsgs` | Messages before updating stats | 1 |
| `statsResetDays` | Days before resetting stats | 7 |

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `config.json`

## Commands

### CLI Commands

- `whatsapp-assistant init [directory]` - Initialize a new bot project
- `whatsapp-assistant start [-c config.json]` - Start the bot
- `whatsapp-assistant config` - Interactive configuration

### WhatsApp Commands

#### Private Message Commands
- `!ignore` or `/ignore` - Bot will ignore your messages
- `!unignore` or `/unignore` - Bot will respond to your messages again

#### Group Commands
- `/stats` - Show group statistics (message counts, top contributors)

## Customization

### AI Prompt

Edit `assets/public_prompt.txt` to customize how your AI assistant behaves. You can also create `assets/prompt.txt` for a private prompt that overrides the public one.

### Stickers

1. Add image files to the `stickers/` directory
2. Update `assets/stickers.csv` with the format:
   ```csv
   emotion,filename,description
   happy,smile.png,A happy smiling face
   sad,cry.png,A crying face
   ```

### File Sharing

Place any files you want the bot to be able to share in the `files_to_share/` directory. Users can ask the bot to share these files.

## Features in Detail

### Group Statistics
- Tracks message counts per group and member
- Shows top 5 contributors
- Automatic periodic resets with backup
- Use `/stats` command in groups to view

### Lore Documentation
- Automatically summarizes group conversations
- Creates narrative-style summaries
- Configurable message threshold
- Saved as text files in `group_lores/`

### AI Actions
The bot can perform various actions based on AI decisions:
- Answer questions
- Share files from the designated directory
- Send contextual stickers
- Ignore conversations when appropriate
