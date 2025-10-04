#!/usr/bin/env node

/**
 * MorphixAI App Creator
 * 快速创建新的 MorphixAI 应用项目
 * 
 * 使用方式：
 * npm run create-app [app-name]
 * 或
 * node scripts/create-app.js [app-name]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

// 不再需要导入 @morphixai/code，直接使用 npx 命令

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');  // monorepo root
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
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

// 验证应用名称
function validateAppName(name) {
    if (!name) {
        return '应用名称不能为空';
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
        return '应用名称只能包含小写字母、数字和连字符';
    }
    if (name.startsWith('-') || name.endsWith('-')) {
        return '应用名称不能以连字符开头或结尾';
    }
    if (name.length < 3) {
        return '应用名称至少需要 3 个字符';
    }
    if (name.length > 50) {
        return '应用名称不能超过 50 个字符';
    }
    return null;
}

// 检查目录是否存在
async function checkDirectoryExists(appName) {
    const appDir = path.join(APPS_DIR, appName);
    try {
        await fs.access(appDir);
        return true;
    } catch {
        return false;
    }
}

// 注意：不再需要模板复制、项目配置更新等函数
// @morphixai/code create 命令会处理所有这些步骤

// 使用 npx @morphixai/code create 创建应用
async function createAppWithMorphixCode(appName, appDisplayName, appDescription, appDir) {
    try {
        log.info('使用 npx @morphixai/code create 创建应用...');
        
        // 确保 apps 目录存在
        await fs.mkdir(APPS_DIR, { recursive: true });
        
        // 构建 npx @morphixai/code create 命令
        const createCommand = `npx @morphixai/code create ${appName}`;
        
        log.info(`执行命令: ${createCommand}`);
        log.info(`工作目录: ${APPS_DIR}`);
        
        // 在 apps 目录下执行命令，确保应用创建在 apps/ 目录下
        execSync(createCommand, { 
            cwd: APPS_DIR, 
            stdio: 'inherit',
            env: { ...process.env }
        });
        
        log.success('使用 @morphixai/code 创建应用成功');
        return true;
    } catch (error) {
        log.error('@morphixai/code 创建失败: ' + error.message);
        log.info('请确保 @morphixai/code 包可用，或检查网络连接');
        return false;
    }
}

// 注意：不再需要手动安装依赖
// @morphixai/code create 命令会自动处理依赖安装

// 主函数
async function main() {
    log.title('🚀 MorphixAI App Creator');
    
    // 不再需要检查模板目录，因为使用 @morphixai/code create
    
    // 获取应用名称
    let appName = process.argv[2];
    
    if (!appName) {
        appName = await prompt('请输入应用名称（小写字母、数字和连字符）');
    }
    
    // 验证应用名称
    const nameError = validateAppName(appName);
    if (nameError) {
        log.error(nameError);
        process.exit(1);
    }
    
    // 检查目录是否已存在
    if (await checkDirectoryExists(appName)) {
        log.error(`目录 ${appName} 已存在`);
        process.exit(1);
    }
    
    // 获取应用显示名称
    const appDisplayName = await prompt(`请输入应用显示名称（默认: ${appName}）`) || appName;
    
    // 获取应用描述
    const appDescription = await prompt('请输入应用描述（可选）') || `${appDisplayName} - A MorphixAI Application`;
    
    // 确认创建
    console.log('\n' + '='.repeat(50));
    log.info(`应用名称: ${colors.bright}${appName}${colors.reset}`);
    log.info(`显示名称: ${colors.bright}${appDisplayName}${colors.reset}`);
    log.info(`应用描述: ${colors.bright}${appDescription}${colors.reset}`);
    console.log('='.repeat(50) + '\n');
    
    const confirm = await prompt('确认创建？(y/N)');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        log.info('已取消创建');
        rl.close();
        process.exit(0);
    }
    
    // 开始创建
    log.title('📦 开始创建应用...');
    
    const appDir = path.join(APPS_DIR, appName);
    
    try {
        // 使用 npx @morphixai/code create 创建应用
        const morphixSuccess = await createAppWithMorphixCode(appName, appDisplayName, appDescription, appDir);
        
        if (!morphixSuccess) {
            log.error('应用创建失败');
            process.exit(1);
        }
        
        // 验证应用是否成功创建在 apps/ 目录下
        const createdAppDir = path.join(APPS_DIR, appName);
        try {
            await fs.access(createdAppDir);
            
            // 进一步验证是否是一个有效的应用目录
            const packageJsonPath = path.join(createdAppDir, 'package.json');
            await fs.access(packageJsonPath);
            
            log.success(`✅ 应用已成功创建在: ${createdAppDir}`);
            log.info(`📁 应用目录: apps/${appName}/`);
        } catch {
            log.error('❌ 应用目录未找到或创建失败');
            log.error(`预期位置: ${createdAppDir}`);
            process.exit(1);
        }
        
        // 完成提示
        console.log('\n' + '='.repeat(50));
        log.title('🎉 应用创建成功！');
        console.log('\n下一步：\n');
        log.info(`cd apps/${appName}`);
        log.info('npm run dev');
        console.log('\n' + '='.repeat(50) + '\n');
        
    } catch (error) {
        log.error('创建失败: ' + error.message);
        console.error(error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// 运行
main().catch((error) => {
    log.error('程序异常退出');
    console.error(error);
    process.exit(1);
});

