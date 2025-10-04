import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟从 tools/cli 目录计算
const cliDir = path.join(__dirname, 'tools/cli');
const ROOT_DIR = path.join(cliDir, '../../..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const TEMPLATE_DIR = path.join(APPS_DIR, 'template');

console.log('CLI Dir:', cliDir);
console.log('ROOT_DIR:', ROOT_DIR);
console.log('APPS_DIR:', APPS_DIR);
console.log('TEMPLATE_DIR:', TEMPLATE_DIR);
console.log('\nResolved paths:');
console.log('ROOT_DIR:', path.resolve(ROOT_DIR));
console.log('TEMPLATE_DIR:', path.resolve(TEMPLATE_DIR));

