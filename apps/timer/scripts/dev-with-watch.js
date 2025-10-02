import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 启动 morphixai 开发环境');
console.log('==================================');

// 启动文件监听器
console.log('📁 启动 apps 文件监听器...');
const watchApps = spawn('node', ['scripts/watch-apps.js'], {
  cwd: path.dirname(__dirname),
  stdio: 'inherit'
});

// 等待 1 秒后启动 Vite 开发服务器
setTimeout(() => {
  console.log('🔧 启动 Vite 开发服务器...');
  const viteServer = spawn('npm', ['run', 'dev:vite'], {
    cwd: path.dirname(__dirname),
    stdio: 'inherit'
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n🛑 关闭开发环境...');
    watchApps.kill('SIGINT');
    viteServer.kill('SIGINT');
    process.exit(0);
  });

  // 监听子进程退出
  watchApps.on('exit', (code) => {
    if (code !== 0) {
      console.log(`❌ 文件监听器退出，代码: ${code}`);
    }
  });

  viteServer.on('exit', (code) => {
    if (code !== 0) {
      console.log(`❌ Vite 服务器退出，代码: ${code}`);
    }
  });

}, 1000);

console.log('✅ 开发环境已启动');
console.log('📄 文件变化会自动生成 /public/app-files.json');
console.log('🌐 访问 http://localhost:3000 查看应用');
console.log('按 Ctrl+C 停止所有服务');
