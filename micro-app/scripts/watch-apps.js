import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义路径
const APPS_DIR = path.join(__dirname, '../src/app');
const DEV_DIR = path.join(__dirname, '../src/_dev');
const APP_FILES_JS = path.join(DEV_DIR, 'app-files.js');

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 递归读取目录下所有文件
async function readDirectoryRecursive(dirPath, basePath = dirPath) {
  const files = {};
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        // 递归读取子目录
        const subFiles = await readDirectoryRecursive(fullPath, basePath);
        Object.assign(files, subFiles);
      } else if (entry.isFile()) {
        // 读取文件内容
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          files[relativePath] = content;
        } catch (error) {
          console.warn(`无法读取文件 ${relativePath}:`, error.message);
          files[relativePath] = '';
        }
      }
    }
  } catch (error) {
    console.error(`读取目录失败 ${dirPath}:`, error.message);
  }
  
  return files;
}

// 生成应用文件的 JS 文件
async function generateAppFilesJs() {
  try {
    console.log('📖 读取 apps 文件夹内容...');
    
    // 读取所有文件
    const appFiles = await readDirectoryRecursive(APPS_DIR);
    
    // 确保 _dev 目录存在
    await fs.mkdir(DEV_DIR, { recursive: true });
    
    // 生成 JS 文件内容
    const jsContent = `// 应用文件配置
// 此文件由监听器自动生成，包含 src/app/ 目录下的所有文件内容

const appFiles = ${JSON.stringify(appFiles, null, 2)};

export default appFiles;`;
    
    await fs.writeFile(APP_FILES_JS, jsContent, 'utf-8');
    
    console.log(`[morphixai]: 已生成 app-files.js`);
    // console.log('📂 文件列表:', Object.keys(appFiles));
    
    return appFiles;
  } catch (error) {
    console.error('❌ 生成 JS 文件失败:', error.message);
    return {};
  }
}

// 防抖版本的生成函数
const debouncedGenerateAppFilesJs = debounce(generateAppFilesJs, 500);

// 开始监听
function startWatching() {
  console.log('👀 开始监听 apps 文件夹变化...');
  console.log(`📍 监听目录: ${APPS_DIR}`);
  console.log(`📄 输出文件: ${APP_FILES_JS}`);
  
  // 监听 apps 文件夹下的所有文件
  const watcher = chokidar.watch(APPS_DIR, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  // 文件变化处理
  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(APPS_DIR, filePath);
      console.log(`📄 新增文件: ${relativePath}`);
      debouncedGenerateAppFilesJs();
    })
    .on('change', (filePath) => {
      const relativePath = path.relative(APPS_DIR, filePath);
      console.log(`📝 修改文件: ${relativePath}`);
      debouncedGenerateAppFilesJs();
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(APPS_DIR, filePath);
      console.log(`🗑️  删除文件: ${relativePath}`);
      debouncedGenerateAppFilesJs();
    })
    .on('error', (error) => {
      console.error('❌ 监听错误:', error);
    });

  console.log('✅ 监听器已启动');
  console.log('按 Ctrl+C 停止监听');

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n🛑 停止监听...');
    watcher.close();
    console.log('✅ 监听器已关闭');
    process.exit(0);
  });
}

// 主函数
async function main() {
  console.log('🚀 启动 morphixai Simple Template Apps 监听器');
  console.log('==================================');
  
  // 初始生成一次 JS 文件
  await generateAppFilesJs();
  
  console.log('==================================');
  
  // 开始监听
  startWatching();
}

// 启动程序
main().catch(error => {
  console.error('❌ 程序启动失败:', error);
  process.exit(1);
});
