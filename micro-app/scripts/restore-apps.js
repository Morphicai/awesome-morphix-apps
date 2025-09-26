import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义路径
const APPS_DIR = path.join(__dirname, '../src/app');
const PUBLIC_DIR = path.join(__dirname, '../src/_dev/');
const APP_FILES_JSON = path.join(PUBLIC_DIR, 'app-files.json');

// 确保目录存在
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`创建目录失败 ${dirPath}:`, error.message);
    throw error;
  }
}

// 从 app-files.json 还原文件到 src/app/ 目录
async function restoreAppFiles() {
  try {
    console.log('🔄 开始从 app-files.json 还原文件...');
    console.log(`📍 源文件: ${APP_FILES_JSON}`);
    console.log(`📂 目标目录: ${APPS_DIR}`);
    console.log('==================================');

    // 检查 app-files.json 是否存在
    try {
      await fs.access(APP_FILES_JSON);
    } catch (error) {
      console.error('❌ app-files.json 文件不存在！');
      console.log('💡 请先运行 "npm run watch-apps" 生成 app-files.json');
      return false;
    }

    // 读取 app-files.json
    const jsonContent = await fs.readFile(APP_FILES_JSON, 'utf-8');
    let appFiles;
    
    try {
      appFiles = JSON.parse(jsonContent);
    } catch (error) {
      console.error('❌ app-files.json 格式错误:', error.message);
      return false;
    }

    if (!appFiles || typeof appFiles !== 'object') {
      console.error('❌ app-files.json 内容无效');
      return false;
    }

    console.log(`📖 读取到 ${Object.keys(appFiles).length} 个文件`);

    // 清空目标目录（可选，这里先注释掉以避免意外删除）
    // console.log('🗑️  清空目标目录...');
    // try {
    //   await fs.rm(APPS_DIR, { recursive: true, force: true });
    // } catch (error) {
    //   // 目录可能不存在，忽略错误
    // }

    // 确保目标目录存在
    await ensureDirectory(APPS_DIR);

    let successCount = 0;
    let errorCount = 0;

    // 还原每个文件
    for (const [relativePath, content] of Object.entries(appFiles)) {
      try {
        const fullPath = path.join(APPS_DIR, relativePath);
        const dirPath = path.dirname(fullPath);
        
        // 确保父目录存在
        await ensureDirectory(dirPath);
        
        // 写入文件内容
        await fs.writeFile(fullPath, content, 'utf-8');
        
        console.log(`✅ 已还原: ${relativePath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 还原失败 ${relativePath}:`, error.message);
        errorCount++;
      }
    }

    console.log('==================================');
    console.log(`🎉 还原完成！`);
    console.log(`✅ 成功: ${successCount} 个文件`);
    if (errorCount > 0) {
      console.log(`❌ 失败: ${errorCount} 个文件`);
    }
    
    return errorCount === 0;
  } catch (error) {
    console.error('❌ 还原过程发生错误:', error.message);
    return false;
  }
}

// 显示帮助信息
function showHelp() {
  console.log('🔄 morphixai Apps 文件还原工具');
  console.log('==================================');
  console.log('此工具将从 app-files.json 还原文件到 src/app/ 目录');
  console.log('');
  console.log('用法:');
  console.log('  npm run restore-apps      # 从 app-files.json 还原文件');
  console.log('  npm run restore-apps help # 显示此帮助信息');
  console.log('');
  console.log('工作流程:');
  console.log('  1. 读取 public/app-files.json');
  console.log('  2. 为每个文件创建对应的目录结构');
  console.log('  3. 将内容写入到 src/app/ 目录下的对应文件');
  console.log('');
  console.log('注意事项:');
  console.log('  - 如果目标文件已存在，将会被覆盖');
  console.log('  - 请确保 app-files.json 格式正确');
  console.log('  - 建议在还原前备份现有文件');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('help') || args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }

  console.log('🚀 启动 morphixai Apps 文件还原器');
  console.log('');
  
  const success = await restoreAppFiles();
  
  if (success) {
    console.log('');
    console.log('💡 提示: 还原完成后，你可以运行以下命令：');
    console.log('  npm run watch-apps  # 重新开始监听文件变化');
    console.log('  npm run dev         # 启动开发服务器');
  }
  
  process.exit(success ? 0 : 1);
}

// 启动程序
main().catch(error => {
  console.error('❌ 程序启动失败:', error);
  process.exit(1);
});
