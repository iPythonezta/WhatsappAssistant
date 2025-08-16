#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('whatsapp-assistant')
  .description('AI-powered WhatsApp assistant bot')
  .version('1.0.0');

program
  .command('init [directory]')
  .description('Initialize a new WhatsApp assistant bot project')
  .action(async (directory) => {
    const projectDir = directory || 'whatsapp-bot';
    const fullPath = path.resolve(projectDir);

    console.log(chalk.blue(`🤖 Initializing WhatsApp Assistant in ${chalk.yellow(fullPath)}`));

    // Create project directory
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Copy template files
    const templateDir = path.join(__dirname, '..', 'templates');
    const configPath = path.join(fullPath, 'config.json');
    
    // Create required directories
    const dirs = ['assets', 'group_stats', 'group_lores', 'stickers', 'files_to_share'];
    dirs.forEach(dir => {
      const dirPath = path.join(fullPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Create subdirectory for backups
    fs.mkdirSync(path.join(fullPath, 'group_stats', 'Backup'), { recursive: true });

    // Copy default assets
    const assetsSource = path.join(__dirname, '..', 'templates', 'assets');
    const stickersSource = path.join(__dirname, '..', 'templates', 'stickers');
    
    if (fs.existsSync(assetsSource)) {
      copyDirectory(assetsSource, path.join(fullPath, 'assets'));
    }
    if (fs.existsSync(stickersSource)) {
      copyDirectory(stickersSource, path.join(fullPath, 'stickers'));
    }

    // Create default config
    const defaultConfig = {
      apiKey: "",
      loreMsgsNo: 3,
      statsUpdateMsgs: 1,
      statsResetDays: 7,
      sessionName: "whatsapp-assistant",
      headless: false
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

    // Create package.json for the project
    const projectPackageJson = {
      name: "my-whatsapp-assistant",
      version: "1.0.0",
      private: true,
      scripts: {
        start: "whatsapp-assistant start"
      }
    };

    fs.writeFileSync(
      path.join(fullPath, 'package.json'), 
      JSON.stringify(projectPackageJson, null, 2)
    );

    console.log(chalk.green('✅ Project initialized successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white(`1. cd ${projectDir}`));
    console.log(chalk.white(`2. Edit config.json to add your Gemini API key`));
    console.log(chalk.white(`3. Add your files to the files_to_share directory`));
    console.log(chalk.white(`4. Add your custom stickers to the stickers directory`));
    console.log(chalk.white(`5. Run: whatsapp-assistant start`));
  });

program
  .command('start')
  .description('Start the WhatsApp assistant bot')
  .option('-c, --config <path>', 'Path to config file', 'config.json')
  .action(async (options) => {
    const configPath = path.resolve(options.config);
    
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Config file not found. Run "whatsapp-assistant init" first.'));
      process.exit(1);
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.apiKey) {
        console.log(chalk.red('❌ API key not found in config.json'));
        console.log(chalk.yellow('Please add your Gemini API key to config.json'));
        process.exit(1);
      }

      console.log(chalk.blue('🚀 Starting WhatsApp Assistant...'));
      
      // Import and start the bot
      const { startBot } = await import('../lib/index.js');
      await startBot(config);
      
    } catch (error) {
      console.log(chalk.red('❌ Error starting bot:'), error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure the bot interactively')
  .action(async () => {
    const configPath = path.resolve('config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Gemini API key:',
        default: config.apiKey || '',
        validate: input => input.length > 0 || 'API key is required'
      },
      {
        type: 'input',
        name: 'sessionName',
        message: 'Enter session name:',
        default: config.sessionName || 'whatsapp-assistant'
      },
      {
        type: 'confirm',
        name: 'headless',
        message: 'Run browser in headless mode?',
        default: config.headless || false
      },
      {
        type: 'number',
        name: 'loreMsgsNo',
        message: 'Number of messages before documenting lore:',
        default: config.loreMsgsNo || 3
      },
      {
        type: 'number',
        name: 'statsUpdateMsgs',
        message: 'Number of messages before updating stats:',
        default: config.statsUpdateMsgs || 1
      },
      {
        type: 'number',
        name: 'statsResetDays',
        message: 'Days before resetting stats:',
        default: config.statsResetDays || 7
      }
    ]);

    fs.writeFileSync(configPath, JSON.stringify(answers, null, 2));
    console.log(chalk.green('✅ Configuration saved!'));
  });

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

program.parse();
