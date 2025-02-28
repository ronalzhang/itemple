# 祈福殿 - Temple of Blessings

一键拜佛烧香祈福网站 - Online Prayer Website

## 项目简介 | Project Introduction

这是一个一键拜佛烧香祈福的网站，支持中英文双语显示，面向全球用户，特别是对藏传佛教感兴趣的外国人。用户可以通过简单的点击完成祈福，并查看全球祈福统计数据。

This is a one-click prayer and incense offering website with bilingual display (Chinese and English), targeting global users, especially foreigners interested in Tibetan Buddhism. Users can complete prayers with a simple click and view global prayer statistics.

## 功能特点 | Features

- 中英文双语界面 | Bilingual interface (Chinese and English)
- 一键祈福功能 | One-click prayer function
- 全球祈福统计 | Global prayer statistics
- 寺庙介绍与图片展示 | Temple introduction and image gallery
- 随缘捐赠功能 | Optional donation function
- 响应式设计，适配各种设备 | Responsive design for all devices

## 技术栈 | Tech Stack

- React.js
- TypeScript
- Ant Design
- i18next (国际化)
- SCSS (样式)
- ECharts (数据可视化)
- GSAP (动画)

## 安装与运行 | Installation and Running

```bash
# 安装依赖 | Install dependencies
npm install

# 开发模式运行 | Run in development mode
npm run dev

# 构建生产版本 | Build for production
npm run build
```

## 项目结构 | Project Structure

```
├── public/             # 静态资源
│   └── images/         # 图片资源
├── src/                # 源代码
│   ├── components/     # 组件
│   ├── i18n/           # 国际化
│   ├── pages/          # 页面
│   ├── services/       # 服务
│   ├── styles/         # 样式
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 主入口
├── index.html          # HTML模板
└── package.json        # 项目配置
```

## 证书 | License

MIT

## 数据模拟工具

为便于测试和演示，本项目提供了数据模拟工具，可快速生成祈福记录。

在项目目录下运行：
node src/server/scripts/directDBGenerator.cjs 5000


### 服务端模拟器（需要后端支持）

如果已部署后端API，可使用服务端模拟器：

```bash
# 安装依赖
npm install node-fetch perf_hooks

# 使用默认数量(3000)生成
node src/scripts/dataSimulator.js

# 指定生成数量
node src/scripts/dataSimulator.js 5000

# 生成随机数量(3000-5000)
node src/scripts/dataSimulator.js 0
```

### 数据库数据生成器（持久化存储）

此工具通过直接调用后端API生成祈福记录，并将数据持久化存储到数据库中。这是最推荐的生成方式，因为：

1. 数据将持久化保存在数据库中
2. 每次网站访问都会显示正确的统计数据
3. 模拟更真实的用户行为模式

使用方法：

```bash
# 进入服务器目录
cd src/server

# 安装依赖
npm install axios dotenv

# 使用默认数量(3000)生成
node scripts/dbDataGenerator.js

# 指定生成数量
node scripts/dbDataGenerator.js 5000
```

此工具会模拟真实的用户访问，包括：
- 根据真实分布生成不同地区的IP地址
- 模拟不同浏览器和设备的User-Agent
- 添加合理的HTTP头信息
- 按批次发送请求，避免服务器过载

### 一键启动服务器并生成数据（推荐使用）

为了进一步简化操作，我们提供了一键启动服务器并生成数据的工具：

```bash
# 安装依赖
npm install

# 使用默认数量(3000)生成
node src/scripts/startAndGenerate.cjs

# 指定生成数量
node src/scripts/startAndGenerate.cjs 5000
```

此工具会：
1. 自动启动后端服务器
2. 等待服务器完全初始化
3. 运行数据生成器生成指定数量的祈福记录
4. 保持服务器运行，直到手动终止

完成后，您可以直接访问 http://localhost:3000 查看结果。

## 注意事项

1. 数据模拟工具仅用于测试和演示目的
2. 在生产环境中，建议移除或禁用这些模拟工具
3. 默认情况下，模拟数据按照真实分布生成，亚洲60%，美洲20%，欧洲15%，其他地区5%
4. 数据库数据生成器会直接写入数据库，请谨慎在生产环境使用
