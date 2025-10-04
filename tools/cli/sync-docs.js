#!/usr/bin/env node

/**
 * MorphixAI Docs Synchronizer
 * 同步核心文档到各个子项目
 * 
 * 使用方式：
 * npm run sync-docs              # 同步所有项目
 * npm run sync-docs timer        # 同步特定项目
 * node scripts/sync-docs.js      # 直接运行
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    gray: '\x1b[90m',
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
    dim: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

// 需要同步的文件和目录
const SYNC_ITEMS = [
    { type: 'file', path: 'CLAUDE.md', description: 'AI 开发规范' },
    { type: 'file', path: 'DEVELOPER.md', description: '开发者文档' },
    { type: 'dir', path: 'docs/context', description: '项目背景文档' },
    { type: 'dir', path: 'docs/requirements', description: '需求文档' },
    { type: 'dir', path: 'docs/technical', description: '技术文档' },
    { type: 'file', path: 'docs/README.md', description: '文档索引' },
    { type: 'file', path: 'docs/README_CN.md', description: '文档索引（中文）' },
];

// 获取所有子项目
async function getSubProjects() {
    const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
        if (entry.isDirectory() && 
            entry.name !== 'node_modules' && 
            entry.name !== '.git' && 
            entry.name !== 'template') { // 排除模板项目
            
            // 检查是否包含 package.json
            const packageJsonPath = path.join(APPS_DIR, entry.name, 'package.json');
            try {
                await fs.access(packageJsonPath);
                projects.push(entry.name);
            } catch {
                // 不是有效的项目
            }
        }
    }
    
    return projects;
}

// 复制文件
async function copyFile(src, dest) {
    try {
        // 确保目标目录存在
        await fs.mkdir(path.dirname(dest), { recursive: true });
        
        // 复制文件
        await fs.copyFile(src, dest);
        return true;
    } catch (error) {
        log.error(`复制文件失败: ${error.message}`);
        return false;
    }
}

// 递归复制目录
async function copyDirectory(src, dest) {
    try {
        // 确保目标目录存在
        await fs.mkdir(dest, { recursive: true });
        
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
        return true;
    } catch (error) {
        log.error(`复制目录失败: ${error.message}`);
        return false;
    }
}

// 同步单个项目
async function syncProject(projectName) {
    log.title(`📦 同步项目: ${projectName}`);
    
    const projectDir = path.join(APPS_DIR, projectName);
    let successCount = 0;
    let failCount = 0;
    
    for (const item of SYNC_ITEMS) {
        const srcPath = path.join(TEMPLATE_DIR, item.path);
        const destPath = path.join(projectDir, item.path);
        
        // 检查源文件是否存在
        try {
            await fs.access(srcPath);
        } catch {
            log.warning(`源文件不存在: ${item.path}`);
            failCount++;
            continue;
        }
        
        // 复制文件或目录
        let success = false;
        if (item.type === 'file') {
            log.dim(`复制文件: ${item.path}`);
            success = await copyFile(srcPath, destPath);
        } else if (item.type === 'dir') {
            log.dim(`复制目录: ${item.path}`);
            success = await copyDirectory(srcPath, destPath);
        }
        
        if (success) {
            successCount++;
            log.success(`${item.description} ✓`);
        } else {
            failCount++;
        }
    }
    
    console.log('');
    log.info(`成功: ${colors.green}${successCount}${colors.reset} | 失败: ${colors.red}${failCount}${colors.reset}`);
    
    return { successCount, failCount };
}

// 主函数
async function main() {
    log.title('📚 MorphixAI 文档同步工具');
    
    // 检查模板目录
    try {
        await fs.access(TEMPLATE_DIR);
    } catch {
        log.error('模板目录不存在: apps/template/');
        log.info('请确保 apps/template 模板项目存在');
        process.exit(1);
    }
    
    // 获取目标项目
    let targetProjects = [];
    const specifiedProject = process.argv[2];
    
    if (specifiedProject) {
        // 检查指定项目是否存在
        const projectDir = path.join(APPS_DIR, specifiedProject);
        try {
            await fs.access(projectDir);
            targetProjects = [specifiedProject];
            log.info(`同步目标: ${colors.bright}${specifiedProject}${colors.reset}`);
        } catch {
            log.error(`项目不存在: ${specifiedProject}`);
            process.exit(1);
        }
    } else {
        // 获取所有子项目
        targetProjects = await getSubProjects();
        
        if (targetProjects.length === 0) {
            log.warning('没有找到任何子项目');
            log.info('你可以使用 npm run create-app 创建新项目');
            process.exit(0);
        }
        
        log.info(`找到 ${colors.bright}${targetProjects.length}${colors.reset} 个项目:`);
        targetProjects.forEach(p => log.dim(`  - ${p}`));
    }
    
    console.log('\n' + '='.repeat(60));
    log.info('将同步以下内容:');
    SYNC_ITEMS.forEach(item => {
        const icon = item.type === 'file' ? '📄' : '📁';
        log.dim(`  ${icon} ${item.path} - ${item.description}`);
    });
    console.log('='.repeat(60) + '\n');
    
    // 开始同步
    let totalSuccess = 0;
    let totalFail = 0;
    
    for (const project of targetProjects) {
        const result = await syncProject(project);
        totalSuccess += result.successCount;
        totalFail += result.failCount;
    }
    
    // 总结
    console.log('\n' + '='.repeat(60));
    log.title('✨ 同步完成！');
    log.info(`共同步 ${colors.bright}${targetProjects.length}${colors.reset} 个项目`);
    log.info(`成功: ${colors.green}${totalSuccess}${colors.reset} | 失败: ${colors.red}${totalFail}${colors.reset}`);
    console.log('='.repeat(60) + '\n');
    
    if (totalFail > 0) {
        log.warning('部分文件同步失败，请检查上方日志');
        process.exit(1);
    }
}

// 运行
main().catch((error) => {
    log.error('程序异常退出');
    console.error(error);
    process.exit(1);
});

