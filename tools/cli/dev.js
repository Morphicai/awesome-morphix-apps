#!/usr/bin/env node

/**
 * MorphixAI Interactive Dev Server
 * 交互式开发服务器 - 使用上下键选择项目
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import prompts from 'prompts';

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
                    const description = packageJson.description || '';
                    projects.push({
                        name: entry.name,
                        displayName: packageJson.name || entry.name,
                        description: description,
                        value: entry.name,
                        title: `${entry.name}${description ? ` - ${description}` : ''}`,
                    });
                }
            } catch {
                // 如果读取失败，跳过
            }
        }
    }
    
    return projects;
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
    
    // 配置 prompts 在取消时不退出
    prompts.override({ cancel: false });
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        try {
            // 获取可用项目
            const projects = await getAvailableProjects();
            
            if (projects.length === 0) {
                log.warning('没有找到任何可开发的项目');
                log.info('创建你的第一个应用吧！');
                
                const { shouldCreate } = await prompts({
                    type: 'confirm',
                    name: 'shouldCreate',
                    message: '现在创建？',
                    initial: true,
                });
                
                if (shouldCreate) {
                    await createNewApp();
                    continue;
                } else {
                    break;
                }
            }
            
            // 准备选项
            const choices = [
                ...projects,
                { 
                    title: `${colors.green}➕ 创建新应用${colors.reset}`,
                    value: '__create__',
                    description: '创建一个新的 MorphixAI 应用'
                },
                { 
                    title: `${colors.dim}❌ 退出${colors.reset}`,
                    value: '__exit__',
                    description: '退出开发环境'
                },
            ];
            
            // 显示选择菜单
            const response = await prompts({
                type: 'select',
                name: 'action',
                message: '选择要开发的应用',
                choices: choices,
                hint: '使用 ↑↓ 键选择，回车确认',
            });
            
            // 用户按 Ctrl+C 取消
            if (!response.action) {
                log.info('\n再见！👋');
                break;
            }
            
            // 处理用户选择
            if (response.action === '__exit__') {
                log.info('再见！👋');
                shouldContinue = false;
                break;
            } else if (response.action === '__create__') {
                const continueAfterCreate = await createNewApp();
                if (!continueAfterCreate) {
                    shouldContinue = false;
                }
                continue;
            } else {
                // 运行选中的项目
                await runProject(response.action);
                // 开发服务器停止后返回菜单
                console.log('\n');
                continue;
            }
        } catch (error) {
            if (error.message.includes('canceled') || error.message.includes('closed')) {
                log.info('\n已取消');
                shouldContinue = false;
            } else {
                log.error(`发生错误: ${error.message}`);
                shouldContinue = false;
            }
        }
    }
}

// 处理进程退出
process.on('SIGINT', () => {
    console.log('\n');
    log.info('再见！👋');
    process.exit(0);
});

// 运行
main().catch((error) => {
    console.error('\n程序异常退出:', error);
    process.exit(1);
});
