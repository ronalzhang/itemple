/**
 * 寺庙网站数据生成器安装脚本
 * 将此脚本复制到浏览器控制台中执行，即可安装数据生成器
 */

(function() {
  // 检查是否已经安装
  if (window.temple && window.temple.generatePrayerRecords) {
    console.log('祈福数据生成器已安装！');
    return;
  }

  // 创建脚本元素
  const script = document.createElement('script');
  script.src = '/scripts/dataGenerator.js';
  script.id = 'templeDataGenerator';
  script.async = true;
  script.onerror = function() {
    console.error('祈福数据生成器加载失败！');
    // 如果加载失败，提供内联代码作为备用选项
    installInlineGenerator();
  };
  
  // 添加到文档中
  document.head.appendChild(script);
  console.log('正在加载祈福数据生成器...');
  
  // 内联安装备用方案
  function installInlineGenerator() {
    const inlineScript = document.createElement('script');
    inlineScript.textContent = `
    // 内联版本的数据生成器（简化版）
    (function() {
      // 区域权重
      const REGION_WEIGHTS = {
        asia: 60,
        europe: 15,
        america: 20,
        others: 5
      };
      
      // 选择区域
      function selectRegion() {
        const rand = Math.random() * 100;
        let cumulative = 0;
        
        for (const [region, weight] of Object.entries(REGION_WEIGHTS)) {
          cumulative += weight;
          if (rand <= cumulative) {
            return region;
          }
        }
        return 'asia';
      }
      
      // 生成随机IP
      function generateRandomIp() {
        return [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256)
        ].join('.');
      }
      
      // 模拟祈福记录
      async function simulatePrayer() {
        try {
          const stats = JSON.parse(localStorage.getItem('templeStats') || '{"todayCount":0,"totalCount":0,"regions":[]}');
          const region = selectRegion();
          
          // 更新计数
          stats.todayCount = (stats.todayCount || 0) + 1;
          stats.totalCount = (stats.totalCount || 0) + 1;
          
          // 确保regions数组存在
          if (!Array.isArray(stats.regions)) {
            stats.regions = [];
          }
          
          // 更新区域
          let found = false;
          for (let i = 0; i < stats.regions.length; i++) {
            if (stats.regions[i].name === region) {
              stats.regions[i].value++;
              found = true;
              break;
            }
          }
          
          if (!found) {
            stats.regions.push({ name: region, value: 1 });
          }
          
          localStorage.setItem('templeStats', JSON.stringify(stats));
          return { success: true };
        } catch (error) {
          console.error('记录失败:', error);
          return { success: false };
        }
      }
      
      // 批量生成
      async function generateData(count = 1000) {
        console.log('开始生成', count, '条记录...');
        const startTime = Date.now();
        let successes = 0;
        
        // 每批100条，避免浏览器卡顿
        const batchSize = 100;
        const batches = Math.ceil(count / batchSize);
        
        for (let b = 0; b < batches; b++) {
          const batchCount = Math.min(batchSize, count - b * batchSize);
          const promises = [];
          
          for (let i = 0; i < batchCount; i++) {
            promises.push(simulatePrayer());
          }
          
          const results = await Promise.all(promises);
          successes += results.filter(r => r.success).length;
          
          // 显示进度
          console.log('完成:', Math.round((b + 1) / batches * 100) + '%');
          
          // 暂停一下，让UI有机会更新
          if (b < batches - 1) {
            await new Promise(r => setTimeout(r, 10));
          }
        }
        
        const duration = Date.now() - startTime;
        console.log('生成完成!', successes, '条记录已添加，耗时:', (duration/1000).toFixed(2), '秒');
      }
      
      // 导出至全局
      window.temple = {
        generatePrayerRecords: generateData,
        generateRandomPrayerRecords: () => generateData(3000 + Math.floor(Math.random() * 2000))
      };
      
      console.log(
        "%c祈福数据生成器(简化版)已加载 %c\\n" +
        "使用方法:\\n" +
        "1. temple.generatePrayerRecords(3000) - 生成指定数量的祈福记录\\n" +
        "2. temple.generateRandomPrayerRecords() - 生成随机数量的祈福记录\\n",
        "color: white; background: #ff5722; padding: 4px; border-radius: 3px; font-weight: bold;",
        "color: black; background: transparent;"
      );
    })();
    `;
    
    document.head.appendChild(inlineScript);
    console.log('祈福数据生成器(内联版)已安装！');
  }
  
  // 检查脚本是否加载成功
  setTimeout(() => {
    if (!window.temple || !window.temple.generatePrayerRecords) {
      console.warn('祈福数据生成器可能未成功加载，尝试安装内联版本...');
      installInlineGenerator();
    }
  }, 3000);
})();

// 提示信息
console.log(
  "%c祈福数据生成器安装脚本 %c\n" +
  "请将dataGenerator.js文件放置在网站的/scripts/目录下，\n" +
  "或者直接使用内联版本（自动安装）。\n" +
  "成功安装后，可以使用以下命令：\n" +
  "1. temple.generatePrayerRecords(3000) - 生成指定数量的祈福记录\n" +
  "2. temple.generateRandomPrayerRecords() - 生成3000-5000条随机祈福记录\n",
  "color: white; background: #4CAF50; padding: 4px; border-radius: 3px; font-weight: bold;",
  "color: black; background: transparent;"
); 