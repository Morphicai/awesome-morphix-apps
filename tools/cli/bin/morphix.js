#!/usr/bin/env node

/**
 * MorphixAI CLI - Unified command-line interface
 * 
 * Usage:
 *   morphix create [name]     - Create a new app
 *   morphix sync [app]        - Sync documentation
 *   morphix install           - Install all dependencies
 *   morphix build             - Build all apps
 *   morphix help              - Show help
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function showHelp() {
    console.log(`
${colors.bright}${colors.cyan}🚀 MorphixAI CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  morphix <command> [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}dev${colors.reset}               Start interactive dev server (select project)
  ${colors.green}create [name]${colors.reset}     Create a new MorphixAI application
  ${colors.green}sync [app]${colors.reset}        Sync documentation to apps
  ${colors.green}install${colors.reset}           Install dependencies for all apps
  ${colors.green}help${colors.reset}              Show this help message

${colors.bright}Examples:${colors.reset}
  morphix dev                 Start interactive dev server
  morphix create my-app       Create a new app called "my-app"
  morphix sync                Sync docs to all apps
  morphix sync timer          Sync docs to "timer" app only
  morphix install             Install all dependencies

${colors.bright}Options:${colors.reset}
  -h, --help                  Show help
  -v, --version               Show version

${colors.bright}For more information:${colors.reset}
  https://github.com/Morphicai/awesome-morphix-apps
`);
}

const command = process.argv[2];

// 移除命令参数，只保留子命令的参数
if (command && !['help', '--help', '-h', '--version', '-v'].includes(command)) {
    process.argv.splice(2, 1);
}

switch (command) {
    case 'dev':
        import('../dev.js');
        break;
    case 'create':
        import('../create-app.js');
        break;
    case 'sync':
        import('../sync-docs.js');
        break;
    case 'install':
        import('../install-all.js');
        break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
        showHelp();
        break;
    case '--version':
    case '-v':
        console.log('1.0.0');
        break;
    default:
        console.log(`${colors.yellow}⚠${colors.reset} Unknown command: ${command}`);
        console.log(`Run ${colors.cyan}morphix help${colors.reset} to see available commands`);
        process.exit(1);
}

