/**
 * 寺庙网站服务器启动和数据生成工具
 * 此脚本会启动后端服务器并自动运行数据生成器
 * 用法: node startAndGenerate.js [count]
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 配置
const DEFAULT_COUNT = 3000; // 默认生成3000条记录
const SERVER_DIR = path.resolve(__dirname, '../../src/server');
const GENERATOR_PATH = path.join(SERVER_DIR, 'scripts/dbDataGenerator.cjs');
const SERVER_STARTUP_TIMEOUT = 10000; // 10秒超时
const SERVER_PORT = 7001; // 修改端口为3001，避免与现有服务冲突

// 显示欢迎界面
function showWelcome() {
  console.log('\n==================================================');
  console.log('   寺庙祈福网站服务器启动 + 数据生成工具 v1.0    ');
  console.log('==================================================\n');
}

// 获取命令行参数
function getCommandLineArgs() {
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  
  if (args.length > 0 && !isNaN(parseInt(args[0]))) {
    count = parseInt(args[0]);
  }
  
  return { count };
}

// 检查服务器目录是否存在
function checkServerDirectory() {
  if (!fs.existsSync(SERVER_DIR)) {
    console.error(`错误: 服务器目录不存在: ${SERVER_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(GENERATOR_PATH)) {
    console.error(`错误: 数据生成器脚本不存在: ${GENERATOR_PATH}`);
    process.exit(1);
  }
}

// 启动服务器
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('启动后端服务器...');
    
    // 切换到服务器目录
    process.chdir(SERVER_DIR);
    
    // 启动服务器进程，设置PORT环境变量
    const serverProcess = spawn('node', ['index.js'], {
      cwd: SERVER_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false, // 保持附加到当前进程
      env: { ...process.env, PORT: SERVER_PORT } // 设置自定义端口
    });
    
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('服务器启动超时'));
    }, SERVER_STARTUP_TIMEOUT);
    
    // 处理输出
    let serverStarted = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[服务器]', output.trim());
      
      // 检查服务器是否已启动
      if (output.includes('服务器已启动') || output.includes('API地址:')) {
        serverStarted = true;
        clearTimeout(timeout);
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('[服务器错误]', data.toString().trim());
    });
    
    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    serverProcess.on('close', (code) => {
      if (!serverStarted) {
        clearTimeout(timeout);
        reject(new Error(`服务器进程意外退出，退出码: ${code}`));
      }
    });
  });
}

// 运行数据生成器
async function runGenerator(count) {
  return new Promise((resolve, reject) => {
    console.log(`\n开始生成 ${count} 条祈福记录...`);
    
    // 运行生成器
    const generatorProcess = spawn('node', [GENERATOR_PATH, count.toString()], {
      cwd: SERVER_DIR,
      stdio: 'inherit'
    });
    
    generatorProcess.on('error', (error) => {
      reject(error);
    });
    
    generatorProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`数据生成器进程退出，退出码: ${code}`));
      }
    });
  });
}

// 等待用户输入
function waitForUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// 主函数
async function main() {
  try {
    showWelcome();
    const { count } = getCommandLineArgs();
    checkServerDirectory();
    
    console.log(`将生成 ${count} 条祈福记录`);
    console.log('准备启动服务器和数据生成...\n');
    
    // 给用户一些时间准备
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 启动服务器
    const serverProcess = await startServer();
    console.log('\n服务器已成功启动!');
    
    // 等待一些时间让服务器完全初始化
    console.log('等待服务器初始化...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 运行数据生成器
    await runGenerator(count);
    
    console.log('\n数据生成完成!');
    console.log('\n服务器仍在运行。您可以在浏览器中访问 http://localhost:3000 查看结果。');
    console.log('按下 Ctrl+C 可以停止服务器。');
    
    // 保持进程运行，直到用户手动终止
    process.stdin.resume();
    
  } catch (error) {
    console.error('\n错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
} 