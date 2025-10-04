#!/usr/bin/env node

/**
 * MorphixAI Batch Installer
 * 批量安装所有子项目的依赖
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');  // monorepo root
const APPS_DIR = path.join(ROOT_DIR, 'apps');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m',
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

async function getProjects() {
    const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
        if (entry.isDirectory() && 
            entry.name !== 'node_modules' && 
            entry.name !== '.git') {
            
            const packageJsonPath = path.join(APPS_DIR, entry.name, 'package.json');
            try {
                await fs.access(packageJsonPath);
                projects.push(entry.name);
            } catch {
                // Not a valid project
            }
        }
    }
    
    return projects;
}

async function installProject(projectName) {
    log.title(`📦 安装: ${projectName}`);
    const projectDir = path.join(APPS_DIR, projectName);
    
    try {
        execSync('npx pnpm install', { cwd: projectDir, stdio: 'inherit' });
        log.success(`${projectName} 安装完成\n`);
        return true;
    } catch (error) {
        log.error(`${projectName} 安装失败\n`);
        return false;
    }
}

async function main() {
    log.title('📦 批量安装所有项目依赖');
    
    const projects = await getProjects();
    
    if (projects.length === 0) {
        log.info('没有找到任何项目');
        process.exit(0);
    }
    
    log.info(`找到 ${projects.length} 个项目: ${projects.join(', ')}\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const project of projects) {
        const success = await installProject(project);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }
    
    log.title('✨ 安装完成！');
    log.info(`成功: ${successCount} | 失败: ${failCount}`);
}

main().catch(console.error);

