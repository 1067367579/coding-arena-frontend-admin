# CodeFlow OJ Admin Console (代码流在线评测系统管理后台前端)

[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.9+-409EFF?logo=element-plus&logoColor=white)](https://element-plus.org/)
[![Sass](https://img.shields.io/badge/Sass-Embedded-CC6699?logo=sass&logoColor=white)](https://sass-lang.com/)

CodeFlow OJ 管理后台前端是专为算法竞赛与在线评测设计的现代化企业级管理系统。基于 **Vue 3 (Composition API)**, **Vite 6** 与 **Element Plus** 构建，提供极致流畅的微动画交互、科学的数据展示与高效的代码管理工具。

---

## 📖 技术文档中心 (Documentation Center)

为了便于团队协作与后期维护，项目包含全套企业级架构与开发文档，请点击下方链接查阅：

* 📘 **[架构设计与技术栈剖析](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/docs/architecture.md)**
  * 详细介绍核心目录结构、初始化生命周期、路由守卫与会话状态、API 请求生命周期及 Mock 数据机制。
* 📗 **[开发者指引与业务模版](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/docs/development.md)**
  * 介绍环境配置文件、Vue 3 开发规约（script setup）、核心公用组件接入方法以及如何快速扩展新页面。
* 🎨 **[设计系统与 SCSS 视觉规范](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/docs/style-guide.md)**
  * 阐释系统颜色 Token、精细过渡动画设计、响应式布局规则与防止 Element Plus 焦点遮挡的排版方案。
* 📙 **[API 通信与网关对接指南](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/docs/api-guide.md)**
  * 详解 Vite 代理设置、Axios 拦截器逻辑（令牌注入与过期自动重定向）以及全量 API 接口方法定义。

---

## 🛠️ 项目快速启动 (Quick Start)

### 1. 安装项目依赖
推荐使用 `Node.js 18+`，运行以下命令安装所需包：
```bash
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
启动后可在浏览器中访问：`http://localhost:5173/`

### 3. 生成生产环境包
对代码进行静态压缩、Tree-shaking 并打包到 `dist/` 目录：
```bash
npm run build
```

### 4. 本地预览打包产物
```bash
npm run preview
```

---

## ⚙️ 环境变量配置

项目根目录包含环境配置文件，开发时主要关注以下变量：

| 变量名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `VITE_USE_MOCK` | `string` (`"true"` / `"false"`) | **是否开启前端 Mock 服务**。为 `"true"` 时使用内置拦截 Mock，为 `"false"` 时通过 Vite 反向代理请求真实后端网关。 |

* 配置文件路径：[.env.development.local](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/.env.development.local)

---

## 📂 核心目录总览

```bash
oj-b/
├── docs/                      # 📖 完整技术文档目录
├── public/                    # 静态资源 (打包时不经 Webpack/Vite 编译)
└── src/                       # 核心业务源码
    ├── apis/                  # 接口模块，按业务划分 (用户/题目/竞赛)
    ├── assets/                # 全局样式scss及矢量图片
    ├── components/            # 全局高复用业务组件 (代码编辑器、难度选择器等)
    ├── router/                # 页面路由声明与路由拦截器
    ├── utils/                 # 全局工具类 (Axios拦截器、Cookie管理、Mock拦截引擎)
    ├── views/                 # 页面视图级组件
    ├── App.vue                # 根视图组件
    └── main.js                # 前端主入口文件
```

关于目录内每个文件的具体职责与关系，请详细查阅 **[架构设计文档](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/docs/architecture.md)**。
