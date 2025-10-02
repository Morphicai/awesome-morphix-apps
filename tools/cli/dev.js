#!/usr/bin/env node

/**
 * MorphixAI Interactive Dev Server
 * 交互式开发服务器 - 选择项目或创建新项目
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
    dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
};

// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// 提示输入
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(`${colors.cyan}?${colors.reset} ${question}: `, (answer) => {
            resolve(answer.trim());
        });
    });
}

// 获取所有可开发的项目
async function getAvailableProjects() {
    const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
        if (entry.isDirectory() && 
            entry.name !== 'node_modules' && 
            entry.name !== '.git' && 
            entry.name !== 'template') { // 排除模板项目
            
            const packageJsonPath = path.join(APPS_DIR, entry.name, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
                
                // 检查是否有 dev 脚本
                if (packageJson.scripts?.dev) {
                    projects.push({
                        name: entry.name,
                        displayName: packageJson.name || entry.name,
                        description: packageJson.description || '',
                        hasDevScript: true,
                    });
                }
            } catch {
                // 如果读取失败，跳过
            }
        }
    }
    
    return projects;
}

// 显示项目列表
function displayProjects(projects) {
    console.log(`\n${colors.bright}📱 可用的应用项目：${colors.reset}\n`);
    
    projects.forEach((project, index) => {
        const number = colors.cyan + (index + 1) + colors.reset;
        const name = colors.bright + project.name + colors.reset;
        const desc = project.description ? colors.dim + ` - ${project.description}` + colors.reset : '';
        console.log(`  ${number}. ${name}${desc}`);
    });
    
    console.log(`\n  ${colors.cyan}n${colors.reset}. ${colors.green}创建新应用${colors.reset}`);
    console.log(`  ${colors.cyan}a${colors.reset}. ${colors.yellow}运行所有应用${colors.reset}`);
    console.log(`  ${colors.cyan}q${colors.reset}. ${colors.dim}退出${colors.reset}\n`);
}

// 运行单个项目
async function runProject(projectName) {
    const projectDir = path.join(APPS_DIR, projectName);
    
    log.title(`🚀 启动开发服务器: ${projectName}`);
    log.info(`项目路径: ${colors.dim}${projectDir}${colors.reset}`);
    log.info(`浏览器将自动打开 ${colors.cyan}http://localhost:8812${colors.reset}\n`);
    
    console.log('='.repeat(60));
    console.log(`${colors.dim}按 Ctrl+C 停止开发服务器${colors.reset}`);
    console.log('='.repeat(60) + '\n');
    
    try {
        // 使用 spawn 来实时显示输出
        execSync('npm run dev', {
            cwd: projectDir,
            stdio: 'inherit',
        });
    } catch (error) {
        if (error.signal !== 'SIGINT') {
            log.error(`启动失败: ${error.message}`);
        }
    }
}

// 运行所有项目
async function runAllProjects() {
    log.title('🚀 启动所有应用（并行模式）');
    log.warning('这将同时启动所有应用，可能会占用较多系统资源');
    
    const confirm = await prompt('确认继续？(y/N)');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        log.info('已取消');
        return false;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.dim}按 Ctrl+C 停止所有开发服务器${colors.reset}`);
    console.log('='.repeat(60) + '\n');
    
    try {
        execSync('npx pnpm --filter "./apps/*" --parallel dev', {
            cwd: ROOT_DIR,
            stdio: 'inherit',
        });
    } catch (error) {
        if (error.signal !== 'SIGINT') {
            log.error(`启动失败: ${error.message}`);
        }
    }
    
    return false;
}

// 创建新应用
async function createNewApp() {
    console.log(''); // 空行
    try {
        execSync('node tools/cli/bin/morphix.js create', {
            cwd: ROOT_DIR,
            stdio: 'inherit',
        });
        return true; // 创建成功后返回菜单
    } catch (error) {
        if (error.signal !== 'SIGINT') {
            log.error('创建失败');
        }
        return true;
    }
}

// 主函数
async function main() {
    log.title('🎯 MorphixAI 交互式开发环境');
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        try {
            // 获取可用项目
            const projects = await getAvailableProjects();
            
            if (projects.length === 0) {
                log.warning('没有找到任何可开发的项目');
                log.info('创建你的第一个应用吧！');
                const shouldCreate = await prompt('现在创建？(Y/n)');
                if (shouldCreate.toLowerCase() !== 'n') {
                    await createNewApp();
                    continue;
                } else {
                    break;
                }
            }
            
            // 显示项目列表
            displayProjects(projects);
            
            // 获取用户选择
            const choice = await prompt('请选择一个选项');
            
            if (choice.toLowerCase() === 'q') {
                log.info('再见！👋');
                shouldContinue = false;
                break;
            } else if (choice.toLowerCase() === 'n') {
                const continueAfterCreate = await createNewApp();
                if (!continueAfterCreate) {
                    shouldContinue = false;
                }
                continue;
            } else if (choice.toLowerCase() === 'a') {
                await runAllProjects();
                continue;
            } else {
                // 数字选择
                const index = parseInt(choice) - 1;
                if (index >= 0 && index < projects.length) {
                    await runProject(projects[index].name);
                    // 开发服务器停止后返回菜单
                    console.log('\n');
                    continue;
                } else {
                    log.error('无效的选择，请重试');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
            }
        } catch (error) {
            if (error.message.includes('canceled')) {
                log.info('\n已取消');
                shouldContinue = false;
            } else {
                log.error(`发生错误: ${error.message}`);
                shouldContinue = false;
            }
        }
    }
    
    rl.close();
}

// 运行
main().catch((error) => {
    console.error('\n程序异常退出:', error);
    rl.close();
    process.exit(1);
});

