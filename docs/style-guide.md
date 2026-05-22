# CodeFlow OJ Admin - 设计系统与 SCSS 视觉规范

项目采用现代 Web 设计语言，结合 Apple 设计美学，在全局配置了高饱和度主题色、毛玻璃微观层级、丰富的弹性物理动画及优雅的响应式滚动处理。本规范详细指导如何在后续开发中保持系统视觉体系的高度一致性。

---

## 🎨 全局设计变量 (Design Tokens)

所有的设计变量与变量映射均集中定义在 [main.scss](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/assets/main.scss) 的 `:root` 选择器中。

### 1. 调色板 (Color Tokens)
* **品牌主色**：`--oj-primary: #007AFF;` (Apple Royal Blue)
  - 强焦点与 Hover 态：`--oj-primary-strong: #0056b3;`
  - 淡色背景（常用于按钮 Plain 态及 Tag）：`--oj-primary-soft: rgba(0, 122, 255, 0.1);`
* **警告与强调**：`--oj-accent: #FF9500;` (Amber Orange)
* **危险与报错**：`--oj-danger: #FF3B30;` (Coral Red)
* **成功与通过**：`--oj-success: #34C759;` (Emerald Green)
* **前景色与文字**：
  - 核心正文：`--oj-ink: #1D1D1F;` (深炭黑)
  - 辅助说明/浅色字：`--oj-muted: #86868B;` (石墨灰)
* **背景与层级**：
  - 页面大背景：`--oj-bg: #F6F7FA;`
  - 卡片/白底容器：`--oj-surface: #FFFFFF;`
  - 灰色交互背景：`--oj-surface-soft: #F5F5F7;`
  - 边框细线：`--oj-line: rgba(0, 0, 0, 0.05);`

### 2. 圆角与阴影 (Radii & Shadows)
* **大圆角 (主卡片、Dialog、Drawer)**：`--oj-radius: 16px;`
* **小圆角 (输入框、下拉菜单、按钮)**：`--oj-radius-sm: 12px;`
* **主层次投影**：`--oj-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);`
* **小悬浮卡片投影**：`--oj-shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.03);`

### 3. 动效曲线 (Motion Curves)
* **弹性阻尼物理曲线**：`--motion-spring: cubic-bezier(0.18, 1.18, 0.22, 1);`
* **平滑减速渐变曲线**：`--motion-spring-soft: cubic-bezier(0.2, 0.9, 0.2, 1);`
* **高回弹干脆曲线**：`--motion-spring-snappy: cubic-bezier(0.22, 1.35, 0.32, 1);`

---

## 📐 页面布局与滚动截断防夹标准

在企业级中后台开发中，如果容器产生滚动剪裁（`overflow`），很容易将子元素向外扩展的边框、投影切断。为了杜绝此类问题，团队制定了以下严格规范：

### 1. 表单滚动容器的防剪裁内边距 (Padding Protection)
当页面使用输入框时，聚焦状态（`.is-focus`）会向外绘制 `3px` 宽的蓝色阴影环。
* **反面教材**：容器内紧贴输入框，设置 `padding-left: 0`。导致聚焦时，左侧阴影环被父容器直接砍掉，显示为一条生硬的垂线。
* **规范操作**：任何作为滚动表单（`overflow-y: auto`）的容器，其四周必须预留不小于 `4px`（推荐 `6px` 以上）的缓冲内边距。例如在 [QuestionDrawer.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/components/QuestionDrawer.vue) 中应用的标准样式：
  ```css
  .drawer-form {
    overflow-y: auto;
    flex: 1;
    padding: 6px 12px 6px 6px; /* 上6px，右12px留给滚动条，下6px，左6px保护发光圈 */
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  ```
  并在表单外的头部（如 `.drawer-header`）设置相应的 `margin-left` 与 `margin-right`，以抵消页面内容的水平偏差，确保视觉中轴完美对齐。

### 2. 动态自适应列表高度 (Dynamic Table Height)
为防止表格高度超出视口导致整个页面向下无限拉伸、分页被挤出视野，必须弃用固定高度：
* **标准表达式**：`height="calc(100vh - 270px)"`
* **含义**：根据当前浏览器物理视口，减去顶部导航、全局面包屑、筛选区卡片及分页栏等所占用的绝对高度。表格将始终自适应浏览器大小，表格内部数据溢出时在表头下方优雅滚动。

---

## ✨ 系统微动画与物理效果 (Animations & Interactions)

系统预设了丰富的动效，新开发页面应主动在对应交互中引入以下类或关键帧：

### 1. 页面进入动画 (Page Transitions)
所有管理后台页面的子视图载入均配置了平滑上升与模糊渐变效果：
```css
/* 参见 main.scss - .admin-page */
.admin-page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.992);
  filter: blur(6px);
}
```

### 2. 浮动背景 blobs 交互 (Floating Orbs)
在登录页 [Login.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/views/Login.vue) 中设计了两个缓速漂浮的半透明毛玻璃彩色团块，通过 `animation` 驱动：
```css
@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-24px) scale(1.05); }
}
```

### 3. 三维层级悬浮卡片 (`.floating-card`)
常用于列表展示与基本信息区块。当鼠标 Hover 时，卡片向上浮动并展现深层次柔和阴影，增强物理感：
```css
.floating-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.09);
}
```

### 4. 数据运行状态点 (.status-pulsar)
在表格展现判题机状态、服务器存活状态时使用，伴随不断向外辐射扩散的柔和波纹：
* **实现原理**：通过伪元素配合 `cf-success-radiate` 动画，向外扩展圆环投影。
* **类别**：`.status-success`（通过/在线），`.status-warning`（编译中/告警），`.status-danger`（错误/离线）。
