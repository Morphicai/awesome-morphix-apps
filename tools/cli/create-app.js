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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');  // monorepo root
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const TEMPLATE_DIR = path.join(APPS_DIR, 'template');

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

// 复制目录（递归）
async function copyDirectory(src, dest, excludeDirs = []) {
    await fs.mkdir(dest, { recursive: true });
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // 跳过排除的目录
        if (excludeDirs.includes(entry.name)) {
            continue;
        }
        
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath, excludeDirs);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

// 生成唯一的项目 ID
function generateProjectId() {
    return `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 更新项目配置
async function updateProjectConfig(appDir, appName, appDisplayName) {
    // 更新 package.json
    const packageJsonPath = path.join(appDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    packageJson.name = appName;
    packageJson.description = `${appDisplayName} - A MorphixAI Application`;
    packageJson.version = '0.1.0';
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4), 'utf-8');
    log.success('更新 package.json');
    
    // 生成项目 ID
    const projectConfigPath = path.join(appDir, 'src/_dev/project-config.json');
    const projectId = generateProjectId();
    const projectConfig = {
        projectId: projectId,
        name: appDisplayName,
        createdAt: new Date().toISOString(),
    };
    
    await fs.writeFile(projectConfigPath, JSON.stringify(projectConfig, null, 4), 'utf-8');
    log.success(`生成项目 ID: ${projectId}`);
    
    // 更新 README.md
    const readmePath = path.join(appDir, 'README.md');
    let readme = await fs.readFile(readmePath, 'utf-8');
    readme = readme.replace(/MorphixAI Code/g, appDisplayName);
    readme = readme.replace(/morphixai-code/g, appName);
    await fs.writeFile(readmePath, readme, 'utf-8');
    log.success('更新 README.md');
}

// 初始化 Git
async function initializeGit(appDir) {
    try {
        execSync('git init', { cwd: appDir, stdio: 'ignore' });
        log.success('初始化 Git 仓库');
    } catch (error) {
        log.warning('Git 初始化失败（可能已存在）');
    }
}

// 安装依赖
async function installDependencies(appDir) {
    log.info('正在安装依赖...');
    try {
        execSync('npx pnpm install', { cwd: appDir, stdio: 'inherit' });
        log.success('依赖安装完成');
        return true;
    } catch (error) {
        log.error('依赖安装失败');
        log.warning('你可以稍后手动运行: cd ' + path.basename(appDir) + ' && npx pnpm install');
        return false;
    }
}

// 主函数
async function main() {
    log.title('🚀 MorphixAI App Creator');
    
    // 检查模板目录
    try {
        await fs.access(TEMPLATE_DIR);
    } catch {
        log.error('模板目录不存在: apps/template/');
        log.info('请确保 apps/template 模板项目存在');
        process.exit(1);
    }
    
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
        // 1. 复制模板
        log.info('复制模板文件...');
        await copyDirectory(TEMPLATE_DIR, appDir, ['node_modules', '.git', 'dist']);
        log.success('模板文件复制完成');
        
        // 2. 更新项目配置
        log.info('更新项目配置...');
        await updateProjectConfig(appDir, appName, appDisplayName);
        
        // 3. 初始化 Git
        log.info('初始化 Git 仓库...');
        await initializeGit(appDir);
        
        // 4. 询问是否安装依赖
        const shouldInstall = await prompt('是否立即安装依赖？(Y/n)');
        if (shouldInstall.toLowerCase() !== 'n' && shouldInstall.toLowerCase() !== 'no') {
            await installDependencies(appDir);
        }
        
        // 5. 完成提示
        console.log('\n' + '='.repeat(50));
        log.title('🎉 应用创建成功！');
        console.log('\n下一步：\n');
        log.info(`cd apps/${appName}`);
        if (shouldInstall.toLowerCase() === 'n' || shouldInstall.toLowerCase() === 'no') {
            log.info('npx pnpm install');
        }
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

