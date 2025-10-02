#!/usr/bin/env node

/**
 * MorphixAI Batch Builder
 * 批量构建所有子项目
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
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

async function getProjects() {
    const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
        if (entry.isDirectory() && 
            entry.name !== 'node_modules' && 
            entry.name !== '.git' && 
            entry.name !== 'template') {  // 排除模板项目
            
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

async function buildProject(projectName) {
    log.title(`🔨 构建: ${projectName}`);
    const projectDir = path.join(APPS_DIR, projectName);
    
    // 检查是否有 build 脚本
    const packageJsonPath = path.join(projectDir, 'package.json');
    try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        if (!packageJson.scripts?.build) {
            log.warning(`${projectName} 没有 build 脚本，跳过\n`);
            return null;
        }
    } catch (error) {
        log.error(`读取 package.json 失败: ${error.message}\n`);
        return false;
    }
    
    try {
        execSync('npm run build', { cwd: projectDir, stdio: 'inherit' });
        log.success(`${projectName} 构建完成\n`);
        return true;
    } catch (error) {
        log.error(`${projectName} 构建失败\n`);
        return false;
    }
}

async function main() {
    log.title('🔨 批量构建所有项目');
    
    const projects = await getProjects();
    
    if (projects.length === 0) {
        log.info('没有找到任何项目');
        process.exit(0);
    }
    
    log.info(`找到 ${projects.length} 个项目: ${projects.join(', ')}\n`);
    
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    
    for (const project of projects) {
        const result = await buildProject(project);
        if (result === true) {
            successCount++;
        } else if (result === false) {
            failCount++;
        } else {
            skipCount++;
        }
    }
    
    log.title('✨ 构建完成！');
    log.info(`成功: ${successCount} | 失败: ${failCount} | 跳过: ${skipCount}`);
    
    if (failCount > 0) {
        process.exit(1);
    }
}

main().catch(console.error);

