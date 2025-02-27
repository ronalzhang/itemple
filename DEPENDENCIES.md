# 项目依赖说明文档

本文档详细介绍了"祈福殿"项目使用的主要依赖包及其用途。

## 核心依赖

### React 相关
- **react (v18.2.0)**: 用于构建用户界面的JavaScript库
- **react-dom (v18.2.0)**: React的DOM渲染器
- **react-router-dom (v6.21.1)**: React应用的路由管理
- **react-i18next (v14.0.0)**: React国际化解决方案

### UI 组件
- **antd (v5.12.8)**: 基于React的企业级UI设计语言和组件库
- **@ant-design/icons (v5.2.6)**: Ant Design的图标库
- **@ant-design/charts (v2.2.6)**: Ant Design的图表组件库

### 样式
- **sass (v1.69.7)**: CSS预处理器，用于编写更结构化的样式

### 国际化
- **i18next (v23.7.16)**: 强大的国际化框架

### 数据可视化
- **echarts (v5.6.0)**: 功能丰富的交互式图表库

### 日期处理
- **lunar-javascript (v1.6.1)**: 中国农历日期处理库

### 动画
- **gsap (v3.12.4)**: 专业级JavaScript动画库

### 网络请求
- **axios (v1.6.5)**: 基于Promise的HTTP客户端，用于浏览器和node.js

## 开发依赖

### 构建工具
- **vite (v5.0.11)**: 新一代前端构建工具
- **@vitejs/plugin-react (v4.2.1)**: Vite的React插件

### TypeScript 支持
- **typescript (v5.3.3)**: JavaScript的超集，添加了静态类型
- **@types/react (v18.2.47)**: React的TypeScript类型定义
- **@types/react-dom (v18.2.18)**: ReactDOM的TypeScript类型定义

### 代码质量
- **eslint (v9.21.0)**: 静态代码分析工具
- **@eslint/js (v9.21.0)**: ESLint的JavaScript支持
- **eslint-plugin-react-hooks (v5.0.0)**: 针对React Hooks的ESLint规则
- **eslint-plugin-react-refresh (v0.4.5)**: 用于React Fast Refresh的ESLint插件
- **globals (v15.15.0)**: ESLint的全局变量配置
- **typescript-eslint (v8.24.1)**: TypeScript的ESLint支持

## 依赖安装

项目依赖可以通过以下命令安装：

```bash
npm install
```

## 开发环境启动

启动开发服务器：

```bash
npm run dev
```

## 生产环境构建

构建生产版本：

```bash
npm run build
``` 