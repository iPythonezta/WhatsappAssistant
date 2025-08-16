# Deployment Guide for WhatsApp AI Assistant NPM Package

## Structure

The project is now organized as follows:

```
WhatsappAssistant/
├── main.js                 # Original bot (for development)
├── GeminiHandler.js        # Original AI handler
├── tools.js               # Original tools
├── README.md              # Original project README
├── assets/                # Original assets
├── stickers/              # Original stickers
├── files_to_share/        # Original files
├── group_stats/           # Original stats
├── group_lores/           # Original lore files
└── package/               # 📦 NPM PACKAGE
    ├── package.json       # NPM package configuration
    ├── README.md          # Package documentation
    ├── setup.bat          # Windows setup script
    ├── setup.sh           # Unix setup script
    ├── bin/
    │   └── cli.js         # Command line interface
    ├── lib/
    │   ├── index.js       # Main bot logic (refactored)
    │   ├── GeminiHandler.js # AI handler (refactored)
    │   └── tools.js       # Utility functions
    └── templates/
        ├── assets/        # Template assets for new projects
        └── stickers/      # Template stickers for new projects
```

## How It Works

### For Users (Installing the Package)

1. **Install globally**:
   ```bash
   npm install -g whatsapp-ai-assistant
   ```

2. **Initialize a new bot project**:
   ```bash
   whatsapp-assistant init my-bot
   cd my-bot
   ```

3. **Configure the bot**:
   ```bash
   whatsapp-assistant config
   # Or edit config.json manually
   ```

4. **Start the bot**:
   ```bash
   whatsapp-assistant start
   ```

### For Developers (Publishing the Package)

1. **Navigate to the package directory**:
   ```bash
   cd package
   ```

2. **Run setup script** (copies assets from parent directory):
   ```bash
   # Windows
   setup.bat
   
   # Unix/Mac
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Test locally**:
   ```bash
   npm link
   whatsapp-assistant init test-bot
   cd test-bot
   whatsapp-assistant start
   ```

4. **Publish to NPM**:
   ```bash
   npm login
   npm publish
   ```

## Key Features

### CLI Commands
- `whatsapp-assistant init [directory]` - Create new bot project
- `whatsapp-assistant start [-c config.json]` - Start the bot
- `whatsapp-assistant config` - Interactive configuration

### User Benefits
- **Easy Setup**: No need to clone repos or manage dependencies
- **Isolated Projects**: Each bot instance is in its own directory
- **Configuration Management**: Simple JSON config with interactive setup
- **Asset Management**: Templates provide starting assets
- **Path Independence**: Works from any directory

## Configuration Flow

1. User installs package globally
2. User runs `init` to create project directory
3. Package copies template assets (stickers, prompts) to project
4. User configures API key and settings
5. User starts bot with their custom configuration

## Publishing Checklist

- [ ] Update version in `package/package.json`
- [ ] Test CLI commands locally with `npm link`
- [ ] Verify asset copying works correctly
- [ ] Test bot initialization and startup
- [ ] Update README with any new features
- [ ] Run `npm publish` from package directory

## Maintenance

The original bot files (main.js, etc.) remain for development and testing. The package folder contains the production-ready NPM package that users will install.
