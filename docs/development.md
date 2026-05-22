# CodeFlow OJ Admin - 开发者指引与业务开发规范

本指南旨在向参与开发的人员阐明 CodeFlow OJ 管理后台的日常开发流程、编码规约、核心业务组件的继承使用方法，以及快速增加一个新功能模块的实践步骤。

---

## ⚙️ 开发环境配置说明

项目通过根目录下的配置文件控制接口网络层行为。

* **本地私有配置**：可在根目录创建 [.env.development.local](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/.env.development.local) 文件。
* **核心配置字段**：
  ```env
  VITE_USE_MOCK=true
  ```
  - `true`：开启本地模拟数据（适配器阻断网络）。适用于前端 UI 独立排版、无后端接口支持的离线场景。
  - `false`：关闭本地模拟数据。前端请求将依据 `vite.config.js` 的代理配置，转发至网关 `http://127.0.0.1:19090`，与真实微服务联调。

---

## 🧩 核心业务组件开发规范

项目在 [src/components](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/components) 中封装了三大核心业务组件，开发新功能时应尽量直接复用或参照其标准编写：

### 1. 代码编辑器 [CodeEditor.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/components/CodeEditor.vue)
基于 Ace-builds 库开发，针对 Java 代码交互进行了专项配置。
* **特性**：内置安全挂载队列，避免因 DOM 未就绪而调用 Ace 实例初始化导致白屏。
* **使用示例**：
  ```html
  <code-editor @update:value="handleCodeUpdate" ref="codeEditorRef" />
  ```
* **方法暴露**：通过 `defineExpose` 暴露了 `setAceCode(code)` 方法，用于在编辑模式下回显代码。

---

### 2. 题目难度选择器 [QuestionSelector.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/components/QuestionSelector.vue)
封装了 Element Plus Select，作为题目难度的独立下拉选项框。
* **特性**：基于 Vue 3 现代的 `defineModel()` 进行双向绑定。
* **使用示例**：
  ```html
  <QuestionSelector v-model="form.difficulty" />
  ```
* **绑定值含义**：`1` -> 简单，`2` -> 中等，`3` -> 困难。

---

### 3. 编辑题目抽屉 [QuestionDrawer.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/components/QuestionDrawer.vue)
封装了复杂的发布与编辑题目表单。
* **测试用例上传规约**：废弃了传统的文本框，统一采用 `<el-upload drag>` 拖拽组件。测试用例文件（支持 `.txt` 与 `.zip`）会作为原生的 `File` 对象直接保存在 `formQuestion.questionCase` 中，提交时需通过 `FormData` 格式上传：
  ```javascript
  const fd = new FormData()
  for (let key in formQuestion) {
    fd.append(key, formQuestion[key]) // 包含二进制文件 File
  }
  await addQuestionService(fd)
  ```
* **富文本集成**：内嵌了 QuillEditor，用于编写题目的 HTML 格式描述，提供优雅的编辑体验。

---

## 💡 前端编码规约 (Coding Conventions)

### 1. 组件书写规约
- 页面及组件文件统一使用 **SFC (Single File Component)**，并启用 `<script setup>` 组合式 API。
- 结构顺序规范统一为：`<template>` -> `<script setup>` -> `<style>`。

### 2. 变量定义指南
- **`ref` 与 `reactive` 的划分**：
  - 单个基础数据类型或控制视图显隐的标识（如 `visible`、`loading`）使用 `ref`；
  - 表单对象或具有复杂联动结构的数据对象使用 `reactive`，以便直接通过 `Object.assign()` 或在 `FormData` 中遍历。
  ```javascript
  const visibleDrawer = ref(false)
  const formQuestion = reactive({
    title: '',
    difficulty: ''
  })
  ```

### 3. 用户提示与交互标准
- 表单提交前必须进行前端格式验证。若验证未通过，使用 `ElMessage.error('错误提示')` 阻断提交。
- 异步网络请求（如保存、更新、删除）捕获异常后，应安全地解析后端可能返回的 `error.message` 并以 `ElMessage.error()` 抛出，禁止吞掉异常或抛出无语义的系统红字报错。

---

## 🚀 业务模块开发实战：以添加新页面为例

假设你需要开发一个新的 **“公告管理”** 功能：

### 🛠️ 步骤 1：添加 API 交互层
在 [src/apis](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis) 下新建 `notice.js`：
```javascript
import request from '@/utils/request'

// 获取公告列表
export function getNoticeListService(params) {
  return request({
    url: '/notice/list',
    method: 'get',
    params
  })
}

// 发布公告
export function addNoticeService(data) {
  return request({
    url: '/notice/add',
    method: 'post',
    data
  })
}
```

---

### 🛠️ 步骤 2：在 Mock 引擎中补充本地模拟数据（若开启 Mock 模式）
若开发阶段无后端微服务，需在 [src/utils/mockService.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/utils/mockService.js) 中加入拦截：
```javascript
// 在 mockRequest 路由分发器中匹配 URL
if (url.includes('/notice/list')) {
  return mockResponse(1000, 'success', [
    { id: 1, title: '首届算法挑战赛开赛公告', time: '2026-05-22' }
  ]);
}
```

---

### 🛠️ 步骤 3：编写视图页面
在 [src/views](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/views) 中创建 `Notice.vue`。页面编写应注重布局的高级质感与响应式高度控制：
```html
<template>
  <div class="admin-content-card">
    <div class="filter-card">
      <el-input v-model="searchQuery" placeholder="输入关键字搜索公告" style="width: 240px" />
      <el-button type="primary" @click="fetchNotices">搜索</el-button>
    </div>
    
    <!-- 表单配合响应式计算高度 -->
    <el-table :data="noticeList" height="calc(100vh - 270px)">
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="time" label="发布时间" width="180px" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNoticeListService } from '@/apis/notice'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const noticeList = ref([])

async function fetchNotices() {
  try {
    const res = await getNoticeListService({ query: searchQuery.value })
    noticeList.value = res.data
  } catch (error) {
    ElMessage.error(error.message || '获取公告失败')
  }
}

onMounted(() => {
  fetchNotices()
})
</script>
```

---

### 🛠️ 步骤 4：配置路由映射
打开 [src/router/index.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/router/index.js)，将新页面注册在 `Layout` 的子路由列表下：
```javascript
{
  path: '/oj/layout',
  name: 'layout',
  component: () => import('@/views/Layout.vue'),
  children: [
    // ... 原有子路由
    {
      path: 'notice',
      name: 'notice',
      component: () => import('@/views/Notice.vue')
    }
  ]
}
```
并在 [Layout.vue](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/views/Layout.vue) 中，根据路由地址补充左侧侧边栏导航对应的 `<el-menu-item index="/oj/layout/notice">` 即可。
