# 一键祈福网站需求文档 | Online Prayer Website Requirements

## 项目概述 | Project Overview
这是一个一键拜佛烧香祈福的网站，支持中英文双语显示，面向全球用户，特别是对藏传佛教感兴趣的外国人。
This is a one-click prayer and incense offering website with bilingual display (Chinese and English), targeting global users, especially foreigners interested in Tibetan Buddhism.

## 网站名称 | Website Name
"祈福殿" / "Temple of Blessings" 或 "心愿禅堂" / "Chamber of Wishes"

## 页面设计与功能 | Page Design and Features

### 1. 整体布局 | General Layout
- 单页应用设计，响应式布局适配各种设备
- Single-page application with responsive design for all devices

### 2. 语言切换 | Language Switch
- 页面顶部提供中/英文切换按钮
- Language toggle (Chinese/English) at the top of the page

### 3. 页面组件 | Page Components

#### 顶部区域 | Header Area
- 寺庙背景图，富有藏传佛教特色
- 网站标题（中英文）
- 网站宗旨："远距祈福，心意相通" / "Distance is no barrier to sincere prayers"

#### 祈福统计区 | Statistics Area
- 今日祈福人数（实时更新）
- 全球祈福分布图（欧洲、美洲、亚洲、其他）
- 累计祈福总人次

#### 核心功能区 | Core Functionality
- 一键祈福按钮（设计为点燃的香或传统莲花形象）
- 祈福动画效果：点击后显示香火燃起或佛光闪现
- 祈福成功提示（中英文）：
  - 中文："祈福成功，下一次喇嘛的诵经祈福是在XX天后（农历XX年XX月XX日，初一/十五）进行。如果希望获得更多福报，请随缘捐赠。"
  - 英文："Prayer successful! The next blessing ceremony by the Lamas will be in XX days (Lunar Calendar: XX/XX/XXXX, 1st/15th day of the lunar month). For more blessings, please consider a donation."

#### 寺庙介绍 | Temple Introduction
- 寺庙历史、文化背景介绍（中英文，200-300字）
- 3-5张高清寺庙图片，左右滑动浏览

#### 随缘捐赠 | Donation Section
- 温馨提示（中英文）："随缘随心，功德无量" / "Donate as you wish, merit is boundless"
- 3-5种主流数字货币的捐赠地址，配以二维码

## 技术要求 | Technical Requirements

### 前端技术栈 | Frontend Stack
- HTML5 + CSS3 + JavaScript
- Vue.js 3.0 框架
- Vite 构建工具
- Element Plus UI组件库
- Axios HTTP客户端
- ECharts 数据可视化
- GSAP 动画库

### 后端技术栈 | Backend Stack
- Python 3.9+
- FastAPI Web框架
- SQLAlchemy ORM
- IP2Location IP地址解析
- JWT 认证
- Celery 任务队列
- Redis 缓存

### 数据库 | Database
- PostgreSQL 14.0+
- 主要数据表:
  - prayer_records (祈福记录表)
  - daily_stats (每日统计表) 
  - region_stats (地区统计表)
- TimescaleDB 时序数据扩展

### 部署环境 | Deployment
- Nginx Web服务器
- Docker 容器化
- AWS/阿里云服务器
- HTTPS 加密

### 1. 数据库设计 | Database Design
- 无需用户注册登录系统
- 记录祈福数据：
  - IP地址（仅用于统计访问人次，重复访问也计入总数）
  - 访问时间
  - 地区归属（欧洲、美洲、亚洲、其他）
- 数据统计表：按日、按地区的祈福人次统计

### 2. 后端功能 | Backend Features
- IP地址解析功能，确定访问者大致地区
- 祈福计数器
- 农历日期计算，自动显示下一个初一或十五的日期
- 数据统计API

### 3. 前端功能 | Frontend Features
- 中英文双语支持
- 响应式设计
- 优雅的祈福动画效果
- 轻量级页面设计，确保快速加载
- 地区统计可视化展示

## 其他考虑 | Other Considerations
- 文化尊重：确保内容尊重藏传佛教文化，不包含不恰当的商业化元素
- 隐私保护：明确说明仅收集匿名的地区统计数据，不记录个人信息
- 更新维护：预留功能扩展接口，方便后续增加功能

## 开发计划 | Development Plan
1. 前端界面设计与实现
2. 后端API开发
3. 数据库设计与实现
4. 中英文翻译校对
5. 测试与部署 