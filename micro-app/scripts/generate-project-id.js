import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义路径
const PROJECT_CONFIG_PATH = path.join(__dirname, '../src/_dev/project-config.json');

/**
 * 生成项目唯一 ID
 * 在 project-config.json 文件中存储项目配置
 * 如果已存在则不重新生成
 */
async function generateProjectId() {
  try {
    console.log('🔍 检查项目配置...');
    
    // 检查配置文件是否存在
    let projectConfig = {};
    try {
      const configContent = await fs.readFile(PROJECT_CONFIG_PATH, 'utf-8');
      projectConfig = JSON.parse(configContent);
    } catch (error) {
      // 文件不存在或无效，使用空配置
      console.log('📄 配置文件不存在，将创建新文件');
    }
    
    // 检查是否已经存在项目 ID
    if (projectConfig.projectId) {
      console.log(`✅ 项目 ID 已存在: ${projectConfig.projectId}`);
      return projectConfig.projectId;
    }
    
    // 生成新的项目 ID
    const projectId = randomUUID();
    console.log(`🆔 生成新的项目 ID: ${projectId}`);
    
    // 更新配置
    projectConfig.projectId = projectId;
    projectConfig.version = '1.0.0';
    
    // 写入配置文件
    await fs.writeFile(PROJECT_CONFIG_PATH, JSON.stringify(projectConfig, null, 2), 'utf-8');
    
    console.log('✅ 项目配置已保存到 src/_dev/project-config.json');
    return projectId;
    
  } catch (error) {
    console.error('❌ 生成项目 ID 失败:', error.message);
    throw error;
  }
}

/**
 * 获取现有的项目 ID
 */
async function getProjectId() {
  try {
    const configContent = await fs.readFile(PROJECT_CONFIG_PATH, 'utf-8');
    const projectConfig = JSON.parse(configContent);
    return projectConfig.projectId || null;
  } catch (error) {
    console.error('❌ 读取项目配置失败:', error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 morphixai 项目 ID 生成器');
  console.log('==================================');
  
  try {
    const projectId = await generateProjectId();
    console.log('==================================');
    console.log(`🎯 项目 ID: ${projectId}`);
    console.log('✅ 完成');
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// 导出函数供其他脚本使用
export { generateProjectId, getProjectId };
